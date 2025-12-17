# 数据抓取模块
# 负责从500.com网站抓取比赛数据和赔率数据

import random
import re
import time
import threading
import traceback

import requests
from bs4 import BeautifulSoup

from config import (BASE_HEADERS, BASE_URL, ENCODING, MAX_DELAY, MAX_RETRIES,
                    MIN_DELAY, REQUEST_TIMEOUT, USER_AGENTS)
from logger import get_logger

# 创建日志记录器
logger = get_logger("scraper")

# 兼容旧代码的HEADERS定义
HEADERS = BASE_HEADERS


class MatchScraper:
    """比赛数据抓取器"""
    
    # 会话对象池
    _session_pool = []
    _max_sessions = 5
    
    # 并发控制信号量
    _semaphore = None
    _max_concurrent_requests = 3
    
    @classmethod
    def _get_semaphore(cls):
        """
        获取或创建信号量
        """
        if cls._semaphore is None:
            cls._semaphore = threading.Semaphore(cls._max_concurrent_requests)
        return cls._semaphore
    
    @classmethod
    def _get_session(cls):
        """
        获取或创建会话对象
        """
        if not cls._session_pool:
            # 创建新会话
            session = requests.Session()
            session.headers.update(BASE_HEADERS)
            # 为每个会话设置随机User-Agent
            session.headers['User-Agent'] = random.choice(USER_AGENTS)
            # 初始化Cookie容器
            session.cookies.update(cls._get_initial_cookies())
            return session
        return cls._session_pool.pop()
    
    @classmethod
    def _get_initial_cookies(cls):
        """
        获取初始Cookie，用于模拟真实用户访问
        """
        return {
            'Hm_lvt_f805f7762a9a04ccf3a8463c590e1e06': str(int(time.time())),
            'Hm_lpvt_f805f7762a9a04ccf3a8463c590e1e06': str(int(time.time())),
            'ASP.NET_SessionId': ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', k=24)),
        }
    
    @classmethod
    def _release_session(cls, session):
        """
        释放会话对象到会话池
        """
        if len(cls._session_pool) < cls._max_sessions:
            cls._session_pool.append(session)

    @staticmethod
    def make_request_with_retries(
        url,
        headers=None,
        retries=MAX_RETRIES,
        timeout=REQUEST_TIMEOUT,
    ):
        """
        带有指数退避策略的同步请求函数
        """
        session = None
        semaphore = MatchScraper._get_semaphore()
        try:
            # 获取信号量，限制并发请求
            with semaphore:
                logger.debug(f"获取到信号量，当前并发请求数: {MatchScraper._max_concurrent_requests - semaphore._value}")
                
                # 获取会话对象
                session = MatchScraper._get_session()
            
            # 构建请求头
            final_headers = dict(session.headers)
            final_headers["User-Agent"] = random.choice(USER_AGENTS)

            # 添加自定义请求头
            if headers:
                final_headers.update(headers)

            for attempt in range(retries):
                try:
                    # 指数退避策略
                    if attempt > 0:
                        # 延迟时间 = 基础延迟 * 2^(尝试次数-1) + 随机抖动
                        base_delay = 0.5 * (2 ** (attempt - 1))
                        jitter = random.uniform(0, 0.5)
                        delay_time = min(base_delay + jitter, MAX_DELAY)
                        time.sleep(delay_time)
                        logger.debug(f"第{attempt+1}次重试请求: {url}, 延迟: {delay_time:.2f}秒")

                    response = session.get(url, headers=final_headers, timeout=timeout)
                    response.raise_for_status()

                    # 根据URL选择合适的编码
                    if "live.500.com" in url:
                        response.encoding = ENCODING["LIVE_MATCHES"]
                    else:
                        response.encoding = ENCODING["ODDS_PAGES"]

                    logger.debug(f"请求成功: {url}, 状态码: {response.status_code}")
                    return response
                except requests.exceptions.ConnectionError as e:
                    logger.warning(f"连接错误 (尝试{attempt+1}/{retries}): {url}, 错误: {e}")
                    if attempt == retries - 1:
                        logger.error(f"连接错误达到最大重试次数: {url}")
                        return None
                except requests.exceptions.Timeout as e:
                    logger.warning(f"请求超时 (尝试{attempt+1}/{retries}): {url}, 错误: {e}")
                    if attempt == retries - 1:
                        logger.error(f"请求超时达到最大重试次数: {url}")
                        return None
                except requests.exceptions.HTTPError as e:
                    logger.warning(f"HTTP错误 (尝试{attempt+1}/{retries}): {url}, 状态码: {e.response.status_code}, 错误: {e}")
                    # 对于4xx错误，通常不需要重试
                    if 400 <= e.response.status_code < 500:
                        logger.error(f"HTTP客户端错误，停止重试: {url}, 状态码: {e.response.status_code}")
                        return None
                    if attempt == retries - 1:
                        logger.error(f"HTTP错误达到最大重试次数: {url}")
                        return None
                except requests.exceptions.RequestException as e:
                    logger.warning(f"请求异常 (尝试{attempt+1}/{retries}): {url}, 错误: {e}")
                    if attempt == retries - 1:
                        logger.error(f"请求异常达到最大重试次数: {url}")
                        return None
        finally:
            # 释放会话对象
            if session:
                MatchScraper._release_session(session)
        return None

    @classmethod
    def fetch_jc_fid_map(cls):
        """
        从https://live.500.com/获取竞彩比赛的fid和标识映射
        """
        url = "https://live.500.com/"
        response = cls.make_request_with_retries(url)
        if not response:
            return {}

        soup = BeautifulSoup(response.text, "html.parser")

        jc_fid_map = {}

        # 找到所有竞彩比赛行（带有gy属性的tr）
        jc_rows = soup.select("tr[gy]")

        for row in jc_rows:
            # 获取fid
            fid = row.get("fid", "")
            if not fid:
                continue

            # 获取第一个td，包含复选框和竞彩标识
            tds = row.select("td")
            if not tds:
                continue

            jc_td = tds[0]
            # 检查是否包含复选框
            if "checkbox" in str(jc_td):
                # 直接获取td的文本内容作为竞彩标识
                jc_mark = jc_td.text.strip()
                if jc_mark:
                    jc_fid_map[fid] = jc_mark

        return jc_fid_map

    @classmethod
    def fetch_live_matches(cls, date=None):
        """
        获取比赛列表，支持直播、历史和未来比赛
        :param date: 日期字符串，格式为YYYY-MM-DD，不传则获取直播比赛
        :return: 比赛列表
        """
        try:
            # 1. 先从https://live.500.com/获取竞彩比赛的fid和标识映射
            jc_fid_map = cls.fetch_jc_fid_map()

            # 2. 根据是否传入日期选择不同的URL
            if date:
                # 获取比赛数据（历史和未来比赛使用相同的URL格式）
                url = BASE_URL["HISTORY_MATCHES"].format(date=date)
            else:
                # 获取直播比赛数据
                url = BASE_URL["LIVE_MATCHES"]

            # 3. 确定比赛类型（历史/未来）
            is_future_match = False
            if date:
                try:
                    import datetime
                    current_date = datetime.date.today()
                    requested_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
                    # 如果请求的日期严格大于今天，则为未来比赛
                    is_future_match = requested_date > current_date
                except Exception as e:
                    logger.error(f"日期解析错误: {e}")
                    is_future_match = False
                
            response = cls.make_request_with_retries(url)
            # 确保响应存在
            if not response:
                logger.error(f"获取比赛列表失败: 响应为空, URL: {url}")
                return []

            soup = BeautifulSoup(response.text, "html.parser")

            # 查找比赛列表
            match_list = []

            # 找到所有比赛行
            match_rows = soup.select("tr[gy]")
            logger.info(f"找到 {len(match_rows)} 个比赛行")

            for idx, row in enumerate(match_rows):
                try:
                    # 解析比赛信息
                    league_td = row.select_one(".ssbox_01")
                    league = league_td.select_one("a") if league_td else None

                    # 通过fid获取竞彩标识
                    fid = row.get("fid", "")
                    jc_mark = jc_fid_map.get(fid, "")

                    # 获取所有td元素
                    tds = row.select("td")
                    
                    # 初始化变量
                    round_info = ""
                    match_time = ""
                    status_text = ""
                    home_team = ""
                    home_team_id = ""
                    away_team = ""
                    away_team_id = ""
                    home_score = ""
                    away_score = ""
                    half_score = ""
                    
                    # 根据是否为历史比赛或未来比赛使用不同的列索引
                    if date:
                        if is_future_match:
                            # 未来比赛页面的列索引
                            # 确保所有字段都有默认值，避免None值导致的问题
                            round_info = tds[1].text.strip() if len(tds) > 1 else ""  # 轮数在第1列
                            match_time = tds[2].text.strip() if len(tds) > 2 else ""  # 时间在第2列
                            status_text = "未开始"  # 未来比赛状态默认为"未开始"
                            
                            # 主队信息 - 未来比赛
                            if len(tds) > 3:
                                home_team_td = tds[3]  # 主队在第3列
                                home_team_a = home_team_td.select_one("a")
                                if home_team_a:
                                    home_team = home_team_a.text.strip()
                                    # 提取主队ID
                                    home_team_href = home_team_a.get("href", "")
                                    home_team_match = re.search(r"team/(\d+)", home_team_href)
                                    if home_team_match:
                                        home_team_id = home_team_match.group(1)
                                else:
                                    # 如果没有链接，直接取文本
                                    home_team = home_team_td.text.strip()
                            
                            # 客队信息 - 未来比赛
                            if len(tds) > 5:
                                away_team_td = tds[5]  # 客队在第5列
                                away_team_a = away_team_td.select_one("a")
                                if away_team_a:
                                    away_team = away_team_a.text.strip()
                                    # 提取客队ID
                                    away_team_href = away_team_a.get("href", "")
                                    away_team_match = re.search(r"team/(\d+)", away_team_href)
                                    if away_team_match:
                                        away_team_id = away_team_match.group(1)
                                else:
                                    # 如果没有链接，直接取文本
                                    away_team = away_team_td.text.strip()
                            
                            # 未来比赛还未开始，比分和半场比分都为空
                            home_score = ""
                            away_score = ""
                            half_score = ""
                            # 确保未来比赛状态被正确设置为"0"（未开始）
                            tr_status = "0"
                        else:
                            # 历史比赛页面的列索引（根据测试结果最终调整）
                            # 确保所有字段都有默认值，避免None值导致的问题
                            round_info = tds[1].text.strip() if len(tds) > 1 else ""  # 轮数在第1列
                            match_time = tds[2].text.strip() if len(tds) > 2 else ""  # 时间在第2列
                            status_text = tds[3].text.strip() if len(tds) > 3 else ""  # 状态在第3列
                            
                            # 主队信息 - 历史比赛
                            if len(tds) > 4:
                                home_team_td = tds[4]  # 主队在第4列
                                home_team_a = home_team_td.select_one("a")
                                if home_team_a:
                                    home_team = home_team_a.text.strip()
                                    # 提取主队ID
                                    home_team_href = home_team_a.get("href", "")
                                    home_team_match = re.search(r"team/(\d+)", home_team_href)
                                    if home_team_match:
                                        home_team_id = home_team_match.group(1)
                                else:
                                    # 如果没有链接，直接取文本
                                    home_team = home_team_td.text.strip()
                            
                            # 客队信息 - 历史比赛
                            if len(tds) > 6:
                                away_team_td = tds[6]  # 客队在第6列
                                away_team_a = away_team_td.select_one("a")
                                if away_team_a:
                                    away_team = away_team_a.text.strip()
                                    # 提取客队ID
                                    away_team_href = away_team_a.get("href", "")
                                    away_team_match = re.search(r"team/(\d+)", away_team_href)
                                    if away_team_match:
                                        away_team_id = away_team_match.group(1)
                                else:
                                    # 如果没有链接，直接取文本
                                    away_team = away_team_td.text.strip()
                            
                            # 抓取比分信息 - 历史比赛
                            if len(tds) > 5:
                                score_td = tds[5]  # 全场比分在第5列
                                # 查找包含比分的元素
                                score_text = score_td.text.strip()
                                # 尝试从文本中提取比分，使用更宽松的正则表达式
                                score_match = re.search(r"(\d+)\s*[-:]\s*(\d+)", score_text)
                                if score_match:
                                    home_score = score_match.group(1)
                                    away_score = score_match.group(2)
                                else:
                                    # 如果没有找到正常比分，尝试查找可能的特殊格式
                                    home_score_match = re.search(r"^(\d+)\s*", score_text)
                                    away_score_match = re.search(r"\s*(\d+)$", score_text)
                                    if home_score_match and away_score_match:
                                        home_score = home_score_match.group(1)
                                        away_score = away_score_match.group(1)
                            
                            # 半场比分 - 历史比赛
                            half_score = ""
                            if len(tds) > 7:
                                half_score_td = tds[7]  # 半场比分在第7列
                                half_score_text = half_score_td.text.strip()
                                # 尝试从文本中提取半场比分，使用更宽松的正则表达式
                                half_match = re.search(r"(\d+)\s*[-:]\s*(\d+)", half_score_text)
                                if half_match:
                                    half_score = f"{half_match.group(1)}-{half_match.group(2)}"
                    else:
                        # 直播比赛页面的列索引
                        if len(tds) > 2:
                            round_info = tds[2].text.strip()
                        if len(tds) > 3:
                            match_time = tds[3].text.strip()
                        if len(tds) > 4:
                            status_text = tds[4].text.strip()
                        
                        # 主队信息 - 直播比赛
                        if len(tds) > 5:
                            home_team_td = tds[5]
                            home_team_a = home_team_td.select_one("a")
                            if home_team_a:
                                home_team = home_team_a.text.strip()
                                # 提取主队ID
                                home_team_href = home_team_a.get("href", "")
                                home_team_match = re.search(r"team/(\d+)", home_team_href)
                                if home_team_match:
                                    home_team_id = home_team_match.group(1)
                        
                        # 客队信息 - 直播比赛
                        if len(tds) > 7:
                            away_team_td = tds[7]
                            away_team_a = away_team_td.select_one("a")
                            if away_team_a:
                                away_team = away_team_a.text.strip()
                                # 提取客队ID
                                away_team_href = away_team_a.get("href", "")
                                away_team_match = re.search(r"team/(\d+)", away_team_href)
                                if away_team_match:
                                    away_team_id = away_team_match.group(1)
                        
                        # 抓取比分信息 - 直播比赛
                        pk_div = row.select_one(".pk")
                        if pk_div:
                            # 主队全场比分
                            clt1 = pk_div.select_one(".clt1")
                            if clt1:
                                home_score = clt1.text.strip()

                            # 客队全场比分
                            clt3 = pk_div.select_one(".clt3")
                            if clt3:
                                away_score = clt3.text.strip()

                        # 半场比分 - 直播比赛
                        if len(tds) > 8:
                            half_score = tds[8].text.strip()

                    # 获取tr标签的属性
                    tr_status = row.get("status", "")
                    fid = row.get("fid", "")
                    sid = row.get("sid", "")
                    
                    # 统一的状态映射
                    status_map = {
                        "未开始": "0",
                        "上半场": "1",
                        "中场结束": "2",
                        "下半场": "3",
                        "已结束": "4",
                        "完": "4",
                        "改期": "6",
                        "待定": "9",
                        "加时赛开始": "10"
                    }
                    
                    # 对于历史和未来比赛，如果tr_status为空或无效，根据status_text设置合适的status值
                    if date:
                        if not tr_status or tr_status not in status_map.values():
                            tr_status = status_map.get(status_text, "")

                    # 获取联赛td的背景色
                    league_bgcolor = league_td.get("bgcolor", "") if league_td else ""

                    # 构造logo链接
                    home_team_logo = (
                        BASE_URL["TEAM_LOGO_BASE"].format(team_id=home_team_id)
                        if home_team_id
                        else ""
                    )
                    away_team_logo = (
                        BASE_URL["TEAM_LOGO_BASE"].format(team_id=away_team_id)
                        if away_team_id
                        else ""
                    )

                    # 创建比赛字典
                    match = {
                        "league": league.text.strip() if league else "",
                        "league_bgcolor": league_bgcolor,
                        "round": round_info,
                        "match_time": match_time,
                        "status_text": status_text,
                        "status": tr_status,
                        "fid": fid,
                        "sid": sid,
                        "jc_mark": jc_mark,
                        "home_team": home_team,
                        "home_team_id": home_team_id,
                        "home_team_logo": home_team_logo,
                        "away_team": away_team,
                        "away_team_id": away_team_id,
                        "away_team_logo": away_team_logo,
                        "home_score": home_score,
                        "away_score": away_score,
                        "half_score": half_score,
                    }

                    match_list.append(match)
                except Exception as e:
                    logger.error(f"解析第{idx+1}个比赛行失败: {e}, 行数据: {row}")
                    logger.debug(traceback.format_exc())
                    # 跳过当前行，继续解析下一个比赛
                    continue

            logger.info(f"成功解析 {len(match_list)} 场比赛")
            return match_list
        except Exception as e:
            logger.error(f"获取直播比赛列表失败: {e}")
            logger.debug(traceback.format_exc())
            return []
    
    @classmethod
    def fetch_match_details(cls, fid):
        """
        获取指定fid的比赛详情，包括球员名单和比赛进程
        """
        try:
            url = f"https://live.500.com/detail.php?fid={fid}"
            logger.info(f"正在获取比赛 {fid} 的详情，URL: {url}")
            response = cls.make_request_with_retries(url)
            if not response:
                logger.error(f"获取比赛详情失败: 响应为空, URL: {url}")
                return None

            logger.info(f"成功获取响应，状态码: {response.status_code}")
            # 设置正确的编码为gbk
            response.encoding = 'gbk'
            soup = BeautifulSoup(response.text, "html.parser")
            match_details = {
                "home_team": {
                    "starting_lineup": [],
                    "substitutes": []
                },
                "away_team": {
                    "starting_lineup": [],
                    "substitutes": []
                },
                "match_events": []
            }

            # 1. 提取球员名单
            # 找到所有包含box_side类的div，这些包含首发和替补阵容
            logger.info("开始提取球员名单")
            box_sides = soup.select(".box_side")
            logger.info(f"找到 {len(box_sides)} 个box_side元素")
            
            # 用于标记当前处理的是主队还是客队
            team_index = 0  # 0: 主队首发, 1: 主队替补, 2: 客队首发, 3: 客队替补
            
            for i, box_side in enumerate(box_sides):
                logger.info(f"处理第 {i+1} 个box_side元素")
                title = box_side.select_one(".title")
                if not title:
                    logger.warning(f"第 {i+1} 个box_side元素没有title")
                    continue
                
                title_text = title.get_text().strip()
                logger.info(f"第 {i+1} 个box_side元素的title: {title_text}")
                content = box_side.select_one(".content")
                if not content:
                    logger.warning(f"第 {i+1} 个box_side元素没有content")
                    continue
                
                player_table = content.select_one("table")
                if not player_table:
                    logger.warning(f"第 {i+1} 个box_side元素的content中没有table")
                    continue
                
                player_rows = player_table.select("tr")
                logger.info(f"第 {i+1} 个box_side元素的table中有 {len(player_rows)} 行")
                for row in player_rows:
                    tds = row.select("td")
                    if len(tds) < 2:
                        continue
                    
                    player_info = tds[1].get_text().strip()
                    if not player_info:
                        continue
                    
                    # 解析球员信息，格式：号码 姓名(位置)
                    player_match = re.match(r"(\d+)\s+(.*?)\((.*?)\)", player_info)
                    if player_match:
                        player = {
                            "number": player_match.group(1),
                            "name": player_match.group(2),
                            "position": player_match.group(3)
                        }
                        
                        # 根据team_index和title_text决定是首发还是替补
                        if title_text == "预计首发阵容":
                            if team_index == 0:
                                match_details["home_team"]["starting_lineup"].append(player)
                                logger.info(f"添加主队首发球员: {player}")
                            else:
                                match_details["away_team"]["starting_lineup"].append(player)
                                logger.info(f"添加客队首发球员: {player}")
                        elif title_text == "后备":
                            if team_index == 1:
                                match_details["home_team"]["substitutes"].append(player)
                                logger.info(f"添加主队替补球员: {player}")
                            else:
                                match_details["away_team"]["substitutes"].append(player)
                                logger.info(f"添加客队替补球员: {player}")
                
                # 更新team_index
                team_index += 1
                if team_index > 3:
                    break

            # 2. 提取比赛进程
            # 找到包含比赛进程的表格
            logger.info("开始提取比赛进程")
            match_table = soup.select_one(".mtable")
            if match_table:
                logger.info("找到mtable元素")
                event_rows = match_table.select("tr")
                logger.info(f"mtable中有 {len(event_rows)} 行")
                # 跳过表头行
                for i, row in enumerate(event_rows[1:]):
                    tds = row.select("td")
                    if len(tds) < 5:
                        logger.warning(f"第 {i+1} 个事件行td数量不足5个，跳过")
                        continue
                    
                    home_event = tds[1].get_text().strip()
                    time = tds[2].get_text().strip()
                    away_event = tds[3].get_text().strip()
                    
                    # 提取图标信息
                    home_icon = tds[0].select_one("img")
                    away_icon = tds[4].select_one("img")
                    
                    # 只添加有有效信息的事件
                    if time or home_event or away_event:
                        event = {
                            "time": time,
                            "home_event": home_event,
                            "away_event": away_event,
                            "home_icon": home_icon.get("src", "") if home_icon else "",
                            "away_icon": away_icon.get("src", "") if away_icon else ""
                        }
                        
                        match_details["match_events"].append(event)
                        logger.info(f"添加比赛事件: {event}")
            else:
                logger.warning("没有找到mtable元素")
                # 尝试使用其他选择器查找比赛进程
                logger.info("尝试使用其他选择器查找比赛进程")
                # 查看所有table元素
                all_tables = soup.select("table")
                logger.info(f"找到 {len(all_tables)} 个table元素")
                # 查看前几个table的类名
                for i, table in enumerate(all_tables[:5]):
                    logger.info(f"第 {i+1} 个table的类名: {table.get('class')}")

            # 3. 提取技术统计数据
            logger.info("开始提取技术统计数据")
            match_details["tech_stats"] = []
            
            # 查找技术统计表格容器
            t2_div = soup.select_one(".t2")
            if t2_div:
                logger.info("找到t2元素")
                
                # 查找包含统计数据的div，它有特定的padding样式
                stats_container = t2_div.select_one('div[style*="padding:0 50px 30px 50px;"]')
                if stats_container:
                    logger.info("找到统计数据容器")
                    # 在这个容器中查找技术统计表格
                    tech_stats_table = stats_container.select_one('table')
                    if tech_stats_table:
                        logger.info("找到技术统计表格")
                        
                        # 获取所有行
                        stat_rows = tech_stats_table.select("tr")
                        logger.info(f"找到 {len(stat_rows)} 个技术统计行")
                        
                        for i, row in enumerate(stat_rows):
                            tds = row.select("td")
                            if len(tds) < 5:
                                continue
                            
                            # 解析技术统计数据
                            # 主队数据栏宽度
                            home_bar = tds[0].select_one(".bar_bg span")
                            home_bar_width = home_bar.get("style", "").split("width:")[1].split("px")[0] if home_bar else "0"
                            
                            # 主队数据值
                            home_value = tds[1].get_text(strip=True)
                            
                            # 统计类型
                            stat_label = tds[2].get_text(strip=True)
                            
                            # 客队数据值
                            away_value = tds[3].get_text(strip=True)
                            
                            # 客队数据栏宽度
                            away_bar = tds[4].select_one(".bar_bg span")
                            away_bar_width = away_bar.get("style", "").split("width:")[1].split("px")[0] if away_bar else "0"
                            
                            # 只添加有有效标签的统计数据
                            if stat_label:
                                tech_stat = {
                                    "label": stat_label,
                                    "homeValue": home_value,
                                    "awayValue": away_value,
                                    "homeBarWidth": home_bar_width,
                                    "awayBarWidth": away_bar_width
                                }
                                match_details["tech_stats"].append(tech_stat)
                                logger.info(f"添加技术统计数据: {tech_stat}")
            else:
                logger.warning("没有找到t2元素，无法提取技术统计数据")
            
            logger.info(f"成功获取比赛 {fid} 的详情")
            logger.info(f"主队首发阵容: {len(match_details['home_team']['starting_lineup'])} 人")
            logger.info(f"主队替补: {len(match_details['home_team']['substitutes'])} 人")
            logger.info(f"客队首发阵容: {len(match_details['away_team']['starting_lineup'])} 人")
            logger.info(f"客队替补: {len(match_details['away_team']['substitutes'])} 人")
            logger.info(f"比赛事件: {len(match_details['match_events'])} 个")
            logger.info(f"技术统计: {len(match_details['tech_stats'])} 项")
            return match_details
        except Exception as e:
            logger.error(f"获取比赛详情失败: {e}")
            logger.debug(traceback.format_exc())
            return None


class OddsScraper:
    """赔率数据抓取器"""

    @staticmethod
    def fetch_match_process(match_id):
        """
        获取比赛进程数据
        """
        details = MatchScraper.fetch_match_details(match_id)
        if details:
            return details['match_events']
        return None
    
    @staticmethod
    def fetch_players(match_id):
        """
        获取球员名单数据
        """
        details = MatchScraper.fetch_match_details(match_id)
        if details:
            return {
                'home_team': details['home_team'],
                'away_team': details['away_team']
            }
        return None
    
    @staticmethod
    def fetch_tech_stats(match_id):
        """
        获取技术统计数据
        """
        details = MatchScraper.fetch_match_details(match_id)
        if details and 'tech_stats' in details:
            return {
                'stats': details['tech_stats']
            }
        return None
    
    @staticmethod
    def fetch_oupei_data(match_id):
        """
        获取欧赔数据
        """
        url = f'{BASE_URL["ODDS_BASE"]}ouzhi-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(
            url,
            {**HEADERS, "referer": f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'},
        )

        if not res or "百家欧赔" not in res.text:
            return None

        try:
            soup = BeautifulSoup(res.text, "lxml")
            data_table = soup.find("table", id="datatb")

            if not data_table:
                return None

            extracted_data = {}

            company_rows = data_table.find_all("tr", id=re.compile(r"^\d+$"))
            for row in company_rows:
                company_td = row.find("td", class_="tb_plgs")
                if not company_td or not company_td.has_attr("title"):
                    continue

                clean_company_name = company_td["title"]
                odds_table = row.find("table", class_="pl_table_data")

                if odds_table:
                    odds_rows = odds_table.find_all("tr")
                    if len(odds_rows) == 2:
                        initial_tds = odds_rows[0].find_all("td")
                        instant_tds = odds_rows[1].find_all("td")

                        extracted_data[clean_company_name] = {
                            "initial": [d.get_text(strip=True) for d in initial_tds],
                            "instant": [d.get_text(strip=True) for d in instant_tds],
                        }

            return extracted_data
        except Exception as e:
            logger.error(f"解析欧赔数据失败: {e}")
            return None

    @staticmethod
    def fetch_yapan_data(match_id):
        """
        获取亚盘数据
        """
        url = f'{BASE_URL["ODDS_BASE"]}yazhi-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(
            url,
            {**HEADERS, "referer": f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'},
        )

        if not res or "亚盘对比" not in res.text:
            return None

        try:
            soup = BeautifulSoup(res.text, "lxml")
            data_table = soup.find("table", id="datatb")

            if not data_table:
                return None

            extracted_data = {}

            company_rows = data_table.find_all("tr", id=re.compile(r"^\d+$"))
            for row in company_rows:
                try:
                    all_tds = row.find_all("td", recursive=False)
                    if len(all_tds) < 6:
                        continue

                    company_link = all_tds[1].find("a")
                    if not company_link or not company_link.has_attr("title"):
                        continue

                    clean_company_name = company_link["title"]
                    instant_table = all_tds[2].find("table")
                    initial_table = all_tds[4].find("table")

                    if instant_table and initial_table:
                        instant_data = [
                            d.get_text(strip=True)
                            for d in instant_table.find_all("td")[:3]
                        ]
                        initial_data = [
                            d.get_text(strip=True)
                            for d in initial_table.find_all("td")[:3]
                        ]

                        if len(instant_data) == 3 and len(initial_data) == 3:
                            extracted_data[clean_company_name] = {
                                "initial": initial_data,
                                "instant": instant_data,
                            }
                except (AttributeError, IndexError):
                    continue

            return extracted_data
        except Exception as e:
            logger.error(f"解析亚盘数据失败: {e}")
            return None

    @staticmethod
    def fetch_daxiao_data(match_id):
        """
        获取大小球数据
        """
        url = f'{BASE_URL["ODDS_BASE"]}daxiao-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(
            url,
            {**HEADERS, "referer": f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'},
        )

        if not res or "大小指数" not in res.text:
            return None

        try:
            soup = BeautifulSoup(res.text, "lxml")
            data_table = soup.find("table", id="datatb")

            if not data_table:
                return None

            extracted_data = {}

            company_rows = data_table.find_all("tr", id=re.compile(r"^\d+$"))
            for row in company_rows:
                try:
                    all_tds = row.find_all("td", recursive=False)
                    if len(all_tds) < 6:
                        continue

                    company_link = all_tds[1].find("a")
                    if not company_link or not company_link.has_attr("title"):
                        continue

                    clean_company_name = company_link["title"]
                    instant_table = all_tds[2].find("table")
                    initial_table = all_tds[4].find("table")

                    if instant_table and initial_table:
                        instant_data = [
                            d.get_text(strip=True)
                            for d in instant_table.find_all("td")[:3]
                        ]
                        initial_data = [
                            d.get_text(strip=True)
                            for d in initial_table.find_all("td")[:3]
                        ]

                        if len(instant_data) == 3 and len(initial_data) == 3:
                            extracted_data[clean_company_name] = {
                                "initial": initial_data,
                                "instant": instant_data,
                            }
                except (AttributeError, IndexError):
                    continue

            return extracted_data
        except Exception as e:
            logger.error(f"解析大小球数据失败: {e}")
            return None

    @staticmethod
    def fetch_match_name(match_id):
        """
        获取比赛名称
        """
        url = f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(url)

        if not res:
            return "获取失败"

        try:
            soup = BeautifulSoup(res.text, "lxml")
            m_sub_title_div = soup.find("div", class_="M_sub_title")

            if m_sub_title_div:
                first_span = m_sub_title_div.find("span")
                if first_span:
                    extracted_text = first_span.get_text(strip=True)
                    # 只保留中文字符
                    chinese_chars = re.findall(r"[\u4e00-\u9fa5]", extracted_text)
                    cleaned_name = "".join(chinese_chars)
                    if cleaned_name:
                        return cleaned_name
            return "未找到比赛名称"
        except Exception:
            return "解析HTML出错"

    @staticmethod
    def fetch_average_data(match_id):
        """
        获取平均数据
        """
        url = f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(url)

        if not res:
            logger.error(f"请求失败: {url}")
            return None

        # 尝试使用更宽松的条件，不依赖于特定文本
        try:
            soup = BeautifulSoup(res.text, "lxml")

            # 寻找所有包含"平均数据"的div
            average_divs = soup.find_all("div", class_="M_box")
            average_data_div = None

            # 遍历查找包含平均数据的div
            for div in average_divs:
                h4 = div.find("h4")
                if h4 and "平均数据" in h4.get_text():
                    average_data_div = div
                    break

            if not average_data_div:
                logger.error(f"未找到平均数据容器: {url}")
                return None

            # 提取球队名称和排名
            team_names = average_data_div.select(".M_sub_title .team_name")
            if len(team_names) < 2:
                logger.error(f"未找到足够的球队名称: {url}")
                return None

            home_team_info = team_names[0].get_text(strip=True)
            away_team_info = team_names[1].get_text(strip=True)

            # 提取平均数据表格 - 调整选择器，使用更通用的选择器
            all_tables = average_data_div.select("table.pub_table")
            if len(all_tables) < 2:
                logger.error(f"未找到足够的平均数据表格: {url}")
                return None

            # 提取数据的辅助函数
            def extract_team_data(table):
                rows = table.select("tbody tr")
                if len(rows) < 3:  # 标题行 + 入球行 + 失球行
                    return None

                # 入球数据
                goals_row = rows[1].select("td")
                # 失球数据
                conceded_row = rows[2].select("td")

                if len(goals_row) < 4 or len(conceded_row) < 4:
                    return None

                return {
                    "goals": {
                        "total": goals_row[1].get_text(strip=True),
                        "home": goals_row[2].get_text(strip=True),
                        "away": goals_row[3].get_text(strip=True),
                    },
                    "conceded": {
                        "total": conceded_row[1].get_text(strip=True),
                        "home": conceded_row[2].get_text(strip=True),
                        "away": conceded_row[3].get_text(strip=True),
                    },
                }

            # 提取饼图数据
            def extract_pie_data(script_content):
                # 从script标签中提取数据
                sum_match = re.search(r'sum\s*=\s*["\']?(\d+)["\']?', script_content)
                total_match = re.search(
                    r'total\s*=\s*["\']?(\d+)["\']?', script_content
                )
                win_num = re.search(r'num1\s*=\s*["\']?(\d+)["\']?', script_content)
                draw_num = re.search(r'num2\s*=\s*["\']?(\d+)["\']?', script_content)
                lose_num = re.search(r'num3\s*=\s*["\']?(\d+)["\']?', script_content)
                goals_for = re.search(
                    r'title1\s*=\s*["\']?入：(\d+)["\']?', script_content
                )
                goals_against = re.search(
                    r'title2\s*=\s*["\']?失：(\d+)["\']?', script_content
                )

                if (
                    not sum_match
                    or not total_match
                    or not win_num
                    or not draw_num
                    or not lose_num
                ):
                    return None

                return {
                    "sum": sum_match.group(1),
                    "total": total_match.group(1),
                    "win": win_num.group(1),
                    "draw": draw_num.group(1),
                    "lose": lose_num.group(1),
                    "goals_for": goals_for.group(1) if goals_for else "0",
                    "goals_against": goals_against.group(1) if goals_against else "0",
                }

            # 获取饼图脚本
            pie_scripts = average_data_div.select("script")
            pie_data = []
            for script in pie_scripts:
                content = script.get_text(strip=True)
                if "FlashObject" in content and "piefoot2.swf" in content:
                    data = extract_pie_data(content)
                    if data:
                        pie_data.append(data)

            # 提取数据
            home_data = extract_team_data(all_tables[0])
            away_data = extract_team_data(all_tables[1])

            if not home_data or not away_data:
                logger.error(f"提取球队数据失败: {url}")
                return None

            result = {
                "home_team": {
                    "name": home_team_info,
                    "average": home_data,
                    "pie_data": pie_data[0] if len(pie_data) > 0 else None,
                },
                "away_team": {
                    "name": away_team_info,
                    "average": away_data,
                    "pie_data": pie_data[1] if len(pie_data) > 1 else None,
                },
            }

            return result
        except Exception as e:
            logger.error(f"解析平均数据失败: {e}, URL: {url}")
            # 打印更多调试信息
            logger.error(f"响应状态: {res.status_code}")
            logger.error(f"响应长度: {len(res.text)}")
            return None
    
    @staticmethod
    def fetch_head_to_head_data(match_id):
        """
        获取两队交战历史数据
        """
        url = f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(url)
        
        if not res:
            logger.error(f'请求失败: {url}')
            return None
        
        try:
            soup = BeautifulSoup(res.text, 'lxml')
            
            # 寻找所有M_box div，看看有哪些
            all_m_box_divs = soup.find_all('div', class_='M_box')
            logger.info(f'找到 {len(all_m_box_divs)} 个 M_box div')
            
            # 遍历所有M_box div，打印h4内容
            for i, div in enumerate(all_m_box_divs):
                h4 = div.find('h4')
                if h4:
                    h4_text = h4.get_text(strip=True)
                    logger.info(f'M_box {i+1} h4内容: {h4_text}')
                    # 检查是否包含"交战历史"或其他相关关键词
                    if "历史" in h4_text or "交战" in h4_text:
                        logger.info(f'找到可能的交战历史div: {h4_text}')
            
            # 寻找包含"交战历史"或"历史"的div
            head_to_head_div = None
            for div in all_m_box_divs:
                h4 = div.find('h4')
                if h4:
                    h4_text = h4.get_text(strip=True)
                    if "交战历史" in h4_text or "历史" in h4_text:
                        head_to_head_div = div
                        logger.info(f'确定使用的交战历史div: {h4_text}')
                        break
            
            if not head_to_head_div:
                logger.error(f'未找到交战历史容器: {url}')
                return None
            
            # 提取交战历史标题
            title_h4 = head_to_head_div.find('h4')
            title = title_h4.get_text(strip=True) if title_h4 else ''
            
            # 提取交战历史统计信息
            stats_span = head_to_head_div.find('span', class_='his_info')
            stats = stats_span.get_text(strip=True) if stats_span else ''
            logger.info(f'交战历史统计信息: {stats}')
            
            # 提取所有表格，看看有哪些
            all_tables = head_to_head_div.find_all('table')
            logger.info(f'在交战历史div中找到 {len(all_tables)} 个表格')
            
            # 提取交战记录表格
            table = None
            for tbl in all_tables:
                if tbl.get('class') and 'pub_table' in tbl.get('class'):
                    table = tbl
                    logger.info('找到pub_table表格')
                    break
            
            # 如果找不到pub_table，就用第一个表格
            if not table and all_tables:
                table = all_tables[0]
                logger.info('使用第一个表格作为备用')
            
            if not table:
                logger.error(f'未找到交战记录表格: {url}')
                return None
            
            # 提取表格数据
            tbody = table.find('tbody')
            if not tbody:
                # 如果没有tbody，直接用table
                logger.info('没有找到tbody，直接使用table')
                rows = table.find_all('tr')
            else:
                rows = tbody.find_all('tr')
            
            logger.info(f'找到 {len(rows)} 行表格数据')
            
            if len(rows) < 2:  # 至少需要标题行和一行数据
                logger.error(f'未找到足够的交战记录行: {url}')
                # 但是我们仍然返回，即使只有标题行
                return {
                    'title': title,
                    'stats': stats,
                    'matches': []
                }
            
            # 解析每一行数据
            matches = []
            for row in rows[1:]:  # 跳过标题行
                # 跳过隐藏行
                if row.get('style') == 'display:none;':
                    continue
                
                tds = row.find_all('td')
                logger.info(f'行 {len(matches)+1} 有 {len(tds)} 个td')
                
                if len(tds) < 10:
                    # 不跳过，而是使用现有的td数据
                    logger.info(f'行 {len(matches)+1} td不足10个，使用现有数据')
                    # 补全td到10个
                    while len(tds) < 10:
                        tds.append(BeautifulSoup('<td></td>', 'lxml').find('td'))
                
                # 提取赛事
                event_td = tds[0]
                event_link = event_td.find('a')
                event = event_link.get_text(strip=True) if event_link else event_td.get_text(strip=True)
                
                # 提取比赛日期
                date = tds[1].get_text(strip=True)
                
                # 辅助函数：去除球队名称中的排名信息
                def remove_rank(team_name):
                    # 去除类似[1]或[2]这样的排名信息
                    return re.sub(r'\[\d+\]', '', team_name).strip()
                
                # 提取对阵信息
                match_td = tds[2]
                match_info = {
                    'home_team': '',
                    'score': '',
                    'away_team': ''
                }
                
                # 尝试多种方式提取对阵信息
                dz_l = match_td.find('span', class_='dz-l')
                dz_r = match_td.find('span', class_='dz-r')
                score_em = match_td.find('em')
                
                if dz_l and dz_r:
                    # 完整提取主队、客队和比分
                    match_info['home_team'] = remove_rank(dz_l.get_text(strip=True))
                    match_info['away_team'] = remove_rank(dz_r.get_text(strip=True))
                    if score_em:
                        match_info['score'] = score_em.get_text(strip=True)
                else:
                    # 尝试直接从td中提取
                    all_spans = match_td.find_all('span')
                    if len(all_spans) >= 3:
                        match_info['home_team'] = remove_rank(all_spans[0].get_text(strip=True))
                        match_info['score'] = all_spans[1].get_text(strip=True)
                        match_info['away_team'] = remove_rank(all_spans[2].get_text(strip=True))
                    else:
                        # 尝试查找所有em标签，可能比分在em标签中
                        all_ems = match_td.find_all('em')
                        if all_ems:
                            for em in all_ems:
                                if em.get_text(strip=True) and 'VS' in em.get_text(strip=True):
                                    match_info['score'] = em.get_text(strip=True)
                        
                        # 尝试获取所有文本并智能分割
                        td_text = match_td.get_text(strip=True)
                        logger.info(f'直接从td提取对阵信息: {td_text}')
                        
                        # 尝试多种分割方式
                        if 'VS' in td_text or 'vs' in td_text:
                            # 使用VS分割
                            split_char = 'VS' if 'VS' in td_text else 'vs'
                            parts = td_text.split(split_char)
                            if len(parts) == 2:
                                match_info['home_team'] = remove_rank(parts[0].strip())
                                match_info['score'] = split_char
                                match_info['away_team'] = remove_rank(parts[1].strip())
                        elif '-' in td_text:
                            # 使用-分割
                            parts = td_text.split('-')
                            if len(parts) == 2:
                                match_info['home_team'] = remove_rank(parts[0].strip())
                                match_info['score'] = '-' 
                                match_info['away_team'] = remove_rank(parts[1].strip())
                        else:
                            # 尝试用空格分割
                            parts = td_text.split()
                            if len(parts) >= 2:
                                # 简单处理：前半部分为主队，后半部分为客队
                                match_info['home_team'] = remove_rank(parts[0])
                                match_info['away_team'] = remove_rank(parts[-1])
                                if len(parts) > 2:
                                    # 中间部分可能包含其他信息，暂时忽略
                                    pass
                
                # 提取半场比分
                half_score = tds[3].get_text(strip=True)
                
                # 提取赛果
                result = tds[4].get_text(strip=True)
                
                # 提取平均欧指
                oupei_p = tds[5].find('p', class_='pub_table_pl')
                oupei = ''
                if oupei_p:
                    oupei_spans = oupei_p.find_all('span')
                    if oupei_spans:
                        oupei = ' '.join([span.get_text(strip=True) for span in oupei_spans])
                else:
                    # 直接从td提取
                    oupei = tds[5].get_text(strip=True)
                
                # 提取亚盘数据
                yapan_p = tds[6].find('p', class_='pub_table_pl')
                yapan = ''
                if yapan_p:
                    yapan_spans = yapan_p.find_all('span')
                    if yapan_spans:
                        yapan = ' '.join([span.get_text(strip=True) for span in yapan_spans])
                else:
                    # 直接从td提取
                    yapan = tds[6].get_text(strip=True)
                
                # 提取盘路
                handicap_result = tds[7].get_text(strip=True)
                
                # 提取大小球
                size_result = tds[8].get_text(strip=True)
                
                # 提取备注
                note = tds[9].get_text(strip=True)
                
                # 构建比赛记录
                match_record = {
                    'event': event,
                    'date': date,
                    'match_info': match_info,
                    'half_score': half_score,
                    'result': result,
                    'oupei': oupei,
                    'yapan': yapan,
                    'handicap_result': handicap_result,
                    'size_result': size_result,
                    'note': note
                }
                
                matches.append(match_record)
                logger.info(f'添加比赛记录: {match_info["home_team"]} {match_info["score"]} {match_info["away_team"]}')
            
            # 构建结果
            logger.info(f'总共提取到 {len(matches)} 条比赛记录')
            result = {
                'title': title,
                'stats': stats,
                'matches': matches
            }
            return result
        except Exception as e:
            logger.error(f'解析交战历史数据失败: {e}, URL: {url}')
            # 保存错误信息到文件
            with open(f"head_to_head_error_{match_id}.txt", "w", encoding="utf-8") as f:
                f.write(f"Error: {e}")
            return None
    
    @staticmethod
    def fetch_recent_records(match_id):
        """
        获取两队近期战绩数据
        """
        url = f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(url)
        
        if not res:
            logger.error(f'请求失败: {url}')
            return None
        
        try:
            soup = BeautifulSoup(res.text, 'lxml')
            
            # 寻找所有M_box div，查找近期战绩部分
            all_m_box_divs = soup.find_all('div', class_='M_box')
            logger.info(f'找到 {len(all_m_box_divs)} 个 M_box div')
            
            recent_records_div = None
            for div in all_m_box_divs:
                h4 = div.find('h4')
                if h4:
                    h4_text = h4.get_text(strip=True)
                    logger.info(f'M_box h4内容: {h4_text}')
                    if "近期战绩" in h4_text:
                        recent_records_div = div
                        logger.info(f'找到近期战绩div: {h4_text}')
                        break
            
            if not recent_records_div:
                logger.error(f'未找到近期战绩容器: {url}')
                return None
            
            # 提取两支球队的近期战绩 - 使用更准确的选择器
            # 尝试查找team_a和team_b类名的div
            team_a = recent_records_div.find('div', class_='team_a')
            team_b = recent_records_div.find('div', class_='team_b')
            
            teams = []
            if team_a:
                teams.append(team_a)
            if team_b:
                teams.append(team_b)
            
            # 如果没有找到team_a和team_b，尝试查找所有包含table的div
            if not teams:
                teams = recent_records_div.find_all('div')
                # 过滤掉不包含pub_table的div
                teams = [team for team in teams if team.find('table', class_='pub_table')]
            
            logger.info(f'找到 {len(teams)} 支球队的近期战绩')
            
            recent_records_data = []
            
            for team_div in teams:
                team_data = {
                    'name': '',
                    'stats': '',
                    'matches': []
                }
                
                # 提取球队名称 - 优化：检查所有strong元素
                team_name_strong = team_div.find('strong', class_='team_name')
                if team_name_strong:
                    team_data['name'] = team_name_strong.get_text(strip=True)
                    logger.info(f'球队名称: {team_data["name"]}')
                else:
                    # 尝试其他方式获取球队名称 - 查找所有strong元素
                    all_strong = team_div.find_all('strong')
                    for strong in all_strong:
                        if 'team_name' in strong.get('class', []):
                            team_data['name'] = strong.get_text(strip=True)
                            logger.info(f'球队名称(strong): {team_data["name"]}')
                            break
                    # 如果还是没找到，尝试查找div.team_name
                    if not team_data['name']:
                        team_name_div = team_div.find('div', class_='team_name')
                        if team_name_div:
                            team_data['name'] = team_name_div.get_text(strip=True)
                            logger.info(f'球队名称(div): {team_data["name"]}')
                
                # 提取比赛记录表格
                team_table = team_div.find('table', class_='pub_table')
                if team_table:
                    tbody = team_table.find('tbody')
                    if tbody:
                        rows = tbody.find_all('tr')
                    else:
                        rows = team_table.find_all('tr')
                    
                    logger.info(f'找到 {len(rows)} 行比赛记录')
                    
                    # 确保至少有标题行
                    if len(rows) < 1:
                        logger.warning(f'球队 {team_data["name"]} 没有表格行')
                        recent_records_data.append(team_data)
                        continue
                    
                    # 解析每一行数据（跳过标题行，从第二行开始）
                    for row in rows[1:]:
                        # 跳过隐藏行
                        if row.get('style') == 'display:none;':
                            logger.info('跳过隐藏行')
                            continue
                        
                        # 检查是否是统计行 - 改进逻辑
                        tds = row.find_all('td')
                        if len(tds) > 0:
                            # 检查是否是 colspan 行
                            if tds[0].get('colspan'):
                                # 查找 record_msg
                                record_msg = row.find('p', class_='record_msg')
                                if record_msg:
                                    team_data['stats'] = record_msg.get_text(strip=True)
                                    logger.info(f'统计数据: {team_data["stats"]}')
                                    continue
                                # 如果没找到，尝试获取td内的所有文本
                                td_text = tds[0].get_text(strip=True)
                                if td_text:
                                    logger.info(f'发现colspan行，文本内容: {td_text}')
                                    # 检查是否包含统计关键字
                                    if '近10场' in td_text or '胜率' in td_text or '赢盘率' in td_text:
                                        team_data['stats'] = td_text
                                        logger.info(f'从td文本提取统计数据: {team_data["stats"]}')
                                        continue
                        
                        tds = row.find_all('td')
                        logger.info(f'行有 {len(tds)} 个td')
                        
                        # 确保有足够的td（至少8个）
                        if len(tds) < 8:
                            logger.warning(f'行td不足8个，跳过，当前td数量：{len(tds)}')
                            continue
                        
                        match_record = {
                            'event': '',
                            'date': '',
                            'match_info': {
                                'home_team': '',
                                'score': '',
                                'away_team': ''
                            },
                            'handicap': '',
                            'half_score': '',
                            'result': '',
                            'handicap_result': '',
                            'size_result': ''
                        }
                        
                        # 1. 提取赛事
                        event_td = tds[0]
                        event_link = event_td.find('a')
                        if event_link:
                            match_record['event'] = event_link.get_text(strip=True)
                        else:
                            match_record['event'] = event_td.get_text(strip=True)
                        logger.info(f'赛事: {match_record["event"]}')
                        
                        # 2. 提取比赛日期
                        match_record['date'] = tds[1].get_text(strip=True)
                        logger.info(f'日期: {match_record["date"]}')
                        
                        # 3. 提取对阵信息 - 优化：更可靠的方式
                        match_td = tds[2]
                        
                        # 直接获取对阵信息的所有文本内容，然后进行解析
                        match_text = match_td.get_text(strip=True)
                        logger.info(f'对阵原始文本: {match_text}')
                        
                        # 尝试从a标签中提取信息
                        a_tag = match_td.find('a')
                        if a_tag:
                            # 从a标签中提取所有span元素
                            spans = a_tag.find_all('span')
                            dz_l = None
                            dz_r = None
                            for span in spans:
                                if 'dz-l' in span.get('class', []):
                                    dz_l = span
                                elif 'dz-r' in span.get('class', []):
                                    dz_r = span
                            
                            # 提取em标签中的比分
                            score_em = a_tag.find('em')
                            
                            # 辅助函数：去除球队名称中的排名信息
                            def remove_rank(team_name):
                                # 去除类似[1]或[2]这样的排名信息
                                return re.sub(r'\[\d+\]', '', team_name).strip()
                            
                            if dz_l and dz_r:
                                match_record['match_info']['home_team'] = remove_rank(dz_l.get_text(strip=True))
                                match_record['match_info']['away_team'] = remove_rank(dz_r.get_text(strip=True))
                                if score_em:
                                    match_record['match_info']['score'] = score_em.get_text(strip=True)
                                logger.info(f'对阵信息: {match_record["match_info"]["home_team"]} {match_record["match_info"]["score"]} {match_record["match_info"]["away_team"]}')
                        
                        # 如果上述方法失败，尝试直接解析文本
                        if not match_record['match_info']['home_team']:
                            logger.info(f'尝试直接解析对阵文本: {match_text}')
                            # 查找比分分隔符
                            score_sep_index = match_text.find(':')
                            if score_sep_index != -1:
                                # 尝试找到主队和客队
                                # 简单处理：比分前为主队，比分为主客队之间的部分，比分后为客队
                                # 但这种方法可能不准确，需要根据实际情况调整
                                logger.warning(f'无法准确解析对阵信息，比分分隔符位置: {score_sep_index}')
                        
                        # 4. 提取盘口
                        match_record['handicap'] = tds[3].get_text(strip=True)
                        
                        # 5. 提取半场比分
                        match_record['half_score'] = tds[4].get_text(strip=True)
                        
                        # 6. 提取赛果
                        match_record['result'] = tds[5].get_text(strip=True)
                        
                        # 7. 提取盘路
                        match_record['handicap_result'] = tds[6].get_text(strip=True)
                        
                        # 8. 提取大小
                        match_record['size_result'] = tds[7].get_text(strip=True)
                        
                        # 只有当至少有部分数据时，才添加到列表中
                        if match_record['event'] or match_record['date'] or match_record['match_info']['home_team']:
                            team_data['matches'].append(match_record)
                            logger.info(f'添加比赛记录: {match_record["match_info"]["home_team"]} {match_record["match_info"]["score"]} {match_record["match_info"]["away_team"]}')
                
                # 如果没有在表格中找到统计数据，尝试在div中查找
                if not team_data['stats']:
                    # 尝试查找record_msg
                    record_msg = team_div.find('p', class_='record_msg')
                    if record_msg:
                        team_data['stats'] = record_msg.get_text(strip=True)
                        logger.info(f'从div中提取统计数据: {team_data["stats"]}')
                    else:
                        # 尝试查找bottom_info
                        bottom_info = team_div.find('div', class_='bottom_info')
                        if bottom_info:
                            logger.info(f'找到bottom_info: {bottom_info}')
                            # 查找bottom_info中的p标签
                            bottom_p = bottom_info.find('p')
                            if bottom_p:
                                bottom_text = bottom_p.get_text(strip=True)
                                logger.info(f'bottom_info p标签内容: {bottom_text}')
                                # 检查是否包含统计关键字
                                if '近' in bottom_text and ('胜' in bottom_text or '平' in bottom_text or '负' in bottom_text):
                                    team_data['stats'] = bottom_text
                                    logger.info(f'从bottom_info提取统计数据: {team_data["stats"]}')
                
                # 添加球队数据
                recent_records_data.append(team_data)
            
            logger.info(f'总共提取到 {len(recent_records_data)} 支球队的近期战绩')
            return recent_records_data
        except Exception as e:
            logger.error(f'解析近期战绩数据失败: {e}, URL: {url}')
            # 保存错误信息到文件
            with open(f"recent_records_error_{match_id}.txt", "w", encoding="utf-8") as f:
                f.write(f"Error: {e}\nTraceback: {traceback.format_exc()}")
            return None
    
    @staticmethod
    def fetch_home_away_records(match_id):
        """
        获取两队区分主客场的近期战绩数据
        """
        url = f'{BASE_URL["ODDS_BASE"]}shuju-{match_id}.shtml'
        res = MatchScraper.make_request_with_retries(url)
        
        if not res:
            logger.error(f'请求失败: {url}')
            return None
        
        try:
            soup = BeautifulSoup(res.text, 'lxml')
            
            # 寻找主客场近期战绩部分 - 使用ID选择器
            home_away_records = []
            
            # 主队近期战绩（ID: team_zhanji2_1）
            team_zhanji2_1 = soup.find('div', id='team_zhanji2_1')
            if team_zhanji2_1:
                logger.info('找到主队主客场战绩div (team_zhanji2_1)')
                home_team_data = {
                    'type': 'home_team',
                    'name': '',
                    'current_type': 'home',  # 默认主场
                    'stats': '',
                    'matches': []
                }
                
                # 提取球队名称
                team_name_strong = team_zhanji2_1.find('strong', class_='team_name')
                if team_name_strong:
                    home_team_data['name'] = team_name_strong.get_text(strip=True)
                    logger.info(f'主队名称: {home_team_data["name"]}')
                
                # 提取当前显示的是主场还是客场
                current_type_em = team_zhanji2_1.find('em', id='home_zj2_1')
                if current_type_em:
                    home_team_data['current_type'] = 'home' if '主场' in current_type_em.get_text() else 'away'
                    logger.info(f'主队当前显示类型: {home_team_data["current_type"]}')
                
                # 提取比赛记录表格
                team_table = team_zhanji2_1.find('table', class_='pub_table')
                if team_table:
                    tbody = team_table.find('tbody')
                    if tbody:
                        rows = tbody.find_all('tr')
                    else:
                        rows = team_table.find_all('tr')
                    
                    logger.info(f'主队找到 {len(rows)} 行比赛记录')
                    
                    if len(rows) > 1:
                        # 解析每一行数据（跳过标题行，从第二行开始）
                        for row in rows[1:]:
                            # 跳过隐藏行
                            if row.get('style') == 'display:none;':
                                continue
                            
                            tds = row.find_all('td')
                            if len(tds) < 8:
                                continue
                            
                            match_record = {
                                'event': '',
                                'date': '',
                                'match_info': {
                                    'home_team': '',
                                    'score': '',
                                    'away_team': ''
                                },
                                'handicap': '',
                                'half_score': '',
                                'result': '',
                                'handicap_result': '',
                                'size_result': ''
                            }
                            
                            # 1. 提取赛事
                            event_td = tds[0]
                            event_link = event_td.find('a')
                            if event_link:
                                match_record['event'] = event_link.get_text(strip=True)
                            else:
                                match_record['event'] = event_td.get_text(strip=True)
                            
                            # 2. 提取比赛日期
                            match_record['date'] = tds[1].get_text(strip=True)
                            
                            # 3. 提取对阵信息
                            match_td = tds[2]
                            a_tag = match_td.find('a')
                            if a_tag:
                                spans = a_tag.find_all('span')
                                dz_l = None
                                dz_r = None
                                for span in spans:
                                    if 'dz-l' in span.get('class', []):
                                        dz_l = span
                                    elif 'dz-r' in span.get('class', []):
                                        dz_r = span
                                
                                score_em = a_tag.find('em')
                                
                                # 辅助函数：去除球队名称中的排名信息
                                def remove_rank(team_name):
                                    # 去除类似[1]或[2]这样的排名信息
                                    return re.sub(r'\[\d+\]', '', team_name).strip()
                                
                                if dz_l and dz_r:
                                    match_record['match_info']['home_team'] = remove_rank(dz_l.get_text(strip=True))
                                    match_record['match_info']['away_team'] = remove_rank(dz_r.get_text(strip=True))
                                    if score_em:
                                        match_record['match_info']['score'] = score_em.get_text(strip=True)
                            
                            # 4. 提取盘口
                            match_record['handicap'] = tds[3].get_text(strip=True)
                            
                            # 5. 提取半场比分
                            match_record['half_score'] = tds[4].get_text(strip=True)
                            
                            # 6. 提取赛果
                            match_record['result'] = tds[5].get_text(strip=True)
                            
                            # 7. 提取盘路
                            match_record['handicap_result'] = tds[6].get_text(strip=True)
                            
                            # 8. 提取大小
                            match_record['size_result'] = tds[7].get_text(strip=True)
                            
                            if match_record['event'] or match_record['date'] or match_record['match_info']['home_team']:
                                home_team_data['matches'].append(match_record)
                    
                    # 提取统计数据
                    bottom_info = team_zhanji2_1.find('div', class_='bottom_info')
                    if bottom_info:
                        bottom_p = bottom_info.find('p')
                        if bottom_p:
                            bottom_text = bottom_p.get_text(strip=True)
                            if '近' in bottom_text and ('胜' in bottom_text or '平' in bottom_text or '负' in bottom_text):
                                home_team_data['stats'] = bottom_text
                                logger.info(f'主队统计数据: {home_team_data["stats"]}')
                
                home_away_records.append(home_team_data)
            
            # 客队近期战绩（ID: team_zhanji2_0）
            team_zhanji2_0 = soup.find('div', id='team_zhanji2_0')
            if team_zhanji2_0:
                logger.info('找到客队主客场战绩div (team_zhanji2_0)')
                away_team_data = {
                    'type': 'away_team',
                    'name': '',
                    'current_type': 'away',  # 默认客场
                    'stats': '',
                    'matches': []
                }
                
                # 提取球队名称
                team_name_strong = team_zhanji2_0.find('strong', class_='team_name')
                if team_name_strong:
                    away_team_data['name'] = team_name_strong.get_text(strip=True)
                    logger.info(f'客队名称: {away_team_data["name"]}')
                
                # 提取当前显示的是主场还是客场
                current_type_em = team_zhanji2_0.find('em', id='home_zj2_0')
                if current_type_em:
                    away_team_data['current_type'] = 'home' if '主场' in current_type_em.get_text() else 'away'
                    logger.info(f'客队当前显示类型: {away_team_data["current_type"]}')
                
                # 提取比赛记录表格
                team_table = team_zhanji2_0.find('table', class_='pub_table')
                if team_table:
                    tbody = team_table.find('tbody')
                    if tbody:
                        rows = tbody.find_all('tr')
                    else:
                        rows = team_table.find_all('tr')
                    
                    logger.info(f'客队找到 {len(rows)} 行比赛记录')
                    
                    if len(rows) > 1:
                        # 解析每一行数据（跳过标题行，从第二行开始）
                        for row in rows[1:]:
                            # 跳过隐藏行
                            if row.get('style') == 'display:none;':
                                continue
                            
                            tds = row.find_all('td')
                            if len(tds) < 8:
                                continue
                            
                            match_record = {
                                'event': '',
                                'date': '',
                                'match_info': {
                                    'home_team': '',
                                    'score': '',
                                    'away_team': ''
                                },
                                'handicap': '',
                                'half_score': '',
                                'result': '',
                                'handicap_result': '',
                                'size_result': ''
                            }
                            
                            # 1. 提取赛事
                            event_td = tds[0]
                            event_link = event_td.find('a')
                            if event_link:
                                match_record['event'] = event_link.get_text(strip=True)
                            else:
                                match_record['event'] = event_td.get_text(strip=True)
                            
                            # 2. 提取比赛日期
                            match_record['date'] = tds[1].get_text(strip=True)
                            
                            # 3. 提取对阵信息
                            match_td = tds[2]
                            a_tag = match_td.find('a')
                            if a_tag:
                                spans = a_tag.find_all('span')
                                dz_l = None
                                dz_r = None
                                for span in spans:
                                    if 'dz-l' in span.get('class', []):
                                        dz_l = span
                                    elif 'dz-r' in span.get('class', []):
                                        dz_r = span
                                
                                score_em = a_tag.find('em')
                                
                                # 辅助函数：去除球队名称中的排名信息
                                def remove_rank(team_name):
                                    # 去除类似[1]或[2]这样的排名信息
                                    return re.sub(r'\[\d+\]', '', team_name).strip()
                                
                                if dz_l and dz_r:
                                    match_record['match_info']['home_team'] = remove_rank(dz_l.get_text(strip=True))
                                    match_record['match_info']['away_team'] = remove_rank(dz_r.get_text(strip=True))
                                    if score_em:
                                        match_record['match_info']['score'] = score_em.get_text(strip=True)
                            
                            # 4. 提取盘口
                            match_record['handicap'] = tds[3].get_text(strip=True)
                            
                            # 5. 提取半场比分
                            match_record['half_score'] = tds[4].get_text(strip=True)
                            
                            # 6. 提取赛果
                            match_record['result'] = tds[5].get_text(strip=True)
                            
                            # 7. 提取盘路
                            match_record['handicap_result'] = tds[6].get_text(strip=True)
                            
                            # 8. 提取大小
                            match_record['size_result'] = tds[7].get_text(strip=True)
                            
                            if match_record['event'] or match_record['date'] or match_record['match_info']['home_team']:
                                away_team_data['matches'].append(match_record)
                    
                    # 提取统计数据
                    bottom_info = team_zhanji2_0.find('div', class_='bottom_info')
                    if bottom_info:
                        bottom_p = bottom_info.find('p')
                        if bottom_p:
                            bottom_text = bottom_p.get_text(strip=True)
                            if '近' in bottom_text and ('胜' in bottom_text or '平' in bottom_text or '负' in bottom_text):
                                away_team_data['stats'] = bottom_text
                                logger.info(f'客队统计数据: {away_team_data["stats"]}')
                
                home_away_records.append(away_team_data)
            
            logger.info(f'总共提取到 {len(home_away_records)} 支球队的主客场战绩')
            return home_away_records
        except Exception as e:
            logger.error(f'解析主客场战绩数据失败: {e}, URL: {url}')
            # 保存错误信息到文件
            with open(f"home_away_records_error_{match_id}.txt", "w", encoding="utf-8") as f:
                f.write(f"Error: {e}\nTraceback: {traceback.format_exc()}")
            return None
