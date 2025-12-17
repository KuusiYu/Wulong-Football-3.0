# 扩展的爬虫方法
# 用于爬取联赛积分榜和联赛平均数据

import re
import traceback

from bs4 import BeautifulSoup

from scraper import MatchScraper
from logger import get_logger

# 创建日志记录器
logger = get_logger("standings_scraper")


class StandingsScraper:
    @staticmethod
    def fetch_standings_data(sid):
        """
        从500彩票网爬取联赛积分榜数据
        
        :param sid: 赛事ID
        :return: 联赛积分榜数据
        """
        url = f"https://liansai.500.com/zuqiu-{sid}/"
        
        try:
            # 使用MatchScraper的重试机制和会话池
            response = MatchScraper.make_request_with_retries(url)
            
            if not response:
                logger.error(f"获取积分榜数据失败: 响应为空, URL: {url}")
                return {
                    "title": "联赛积分榜",
                    "teams": []
                }
            
            # 设置正确的编码
            response.encoding = 'gb2312'
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 初始化返回数据
            standings_data = {
                "title": "联赛积分榜",
                "teams": []
            }
            
            # 查找积分榜表格 - 使用正确的类名
            standings_table = soup.find('table', class_='lstable1')
            if not standings_table:
                logger.warning(f"未找到积分榜表格, URL: {url}")
                return standings_data
            
            # 查找表格标题
            title_element = soup.find('h2', class_='league_title')
            if title_element:
                standings_data['title'] = title_element.text.strip()
            
            # 解析表格数据 - 直接查找tr元素，不需要tbody
            rows = standings_table.find_all('tr')
            logger.info(f"找到 {len(rows)} 个行, URL: {url}")
            
            # 跳过表头行，直接处理数据行
            for idx, row in enumerate(rows):
                try:
                    cols = row.find_all('td')
                    # 确保有足够的列
                    if len(cols) >= 7:
                        # 检查是否是表头行
                        if cols[0].get('colspan') or not cols[0].text.strip().isdigit():
                            continue
                            
                        team_data = {
                            "rank": cols[0].text.strip(),
                            "name": cols[1].text.strip(),
                            "matches": cols[2].text.strip(),
                            "wins": cols[3].text.strip(),
                            "draws": cols[4].text.strip(),
                            "losses": cols[5].text.strip(),
                            "points": cols[6].text.strip()
                        }
                        standings_data['teams'].append(team_data)
                        logger.debug(f"成功解析第 {idx+1} 行球队数据: {team_data['name']}")
                except Exception as e:
                    logger.error(f"解析第 {idx+1} 行数据失败: {e}, URL: {url}")
                    continue
            
            logger.info(f"成功解析 {len(standings_data['teams'])} 支球队的积分榜数据, URL: {url}")
            return standings_data
        except Exception as e:
            logger.error(f"爬取积分榜数据失败: {e}, URL: {url}")
            logger.debug(traceback.format_exc())
            return {
                "title": "联赛积分榜",
                "teams": []
            }

    @staticmethod
    def fetch_league_average_data(sid):
        """
        从500彩票网爬取联赛平均数据
        
        :param sid: 赛事ID
        :return: 联赛平均数据
        """
        url = f"https://liansai.500.com/zuqiu-{sid}/"
        
        try:
            # 使用MatchScraper的重试机制和会话池
            response = MatchScraper.make_request_with_retries(url)
            
            if not response:
                logger.error(f"获取联赛平均数据失败: 响应为空, URL: {url}")
                return {
                    "homeGoals": "0",
                    "awayGoals": "0"
                }
            
            # 设置正确的编码
            response.encoding = 'gb2312'
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 初始化返回数据
            league_average_data = {
                "homeGoals": "0",
                "awayGoals": "0"
            }
            
            # 查找联赛平均数据表格
            stats_table = soup.find('table', class_='lchart')
            if not stats_table:
                logger.warning(f"未找到联赛平均数据表格, URL: {url}")
                return league_average_data
            
            # 查找数据行
            rows = stats_table.find_all('tr')
            if len(rows) >= 2:
                try:
                    # 数据在第2行的第2个单元格
                    data_row = rows[1]
                    cells = data_row.find_all('td')
                    if len(cells) >= 2:
                        avg_text = cells[1].get_text(strip=True)
                        logger.debug(f"平均数据文本: {avg_text}, URL: {url}")
                        
                        # 使用正则表达式提取数据
                        # 更宽松的提取方式，匹配一位或两位小数
                        home_goals_match = re.search(r'主队场均进球(\d+\.\d{1,2})', avg_text)
                        if home_goals_match:
                            league_average_data['homeGoals'] = home_goals_match.group(1)
                        
                        away_goals_match = re.search(r'客队场均进球(\d+\.\d{1,2})', avg_text)
                        if away_goals_match:
                            league_average_data['awayGoals'] = away_goals_match.group(1)
                except Exception as e:
                    logger.error(f"解析联赛平均数据失败: {e}, URL: {url}")
                    logger.debug(traceback.format_exc())
            
            logger.info(f"成功解析联赛平均数据: 主队场均 {league_average_data['homeGoals']}, 客队场均 {league_average_data['awayGoals']}, URL: {url}")
            return league_average_data
        except Exception as e:
            logger.error(f"爬取联赛平均数据失败: {e}, URL: {url}")
            logger.debug(traceback.format_exc())
            return {
                "homeGoals": "0",
                "awayGoals": "0"
            }