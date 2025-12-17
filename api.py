# API接口模块
# 提供与前端交互的API接口

from flask import Blueprint, jsonify

from logger import get_logger
from scraper import MatchScraper, OddsScraper
from static.scraper_extensions import StandingsScraper

# 创建日志记录器
logger = get_logger("api")

# 创建蓝图对象
api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/odds/<match_id>")
def api_get_all_odds(match_id):
    """
    API接口：获取所有赔率数据
    """
    try:
        match_name = OddsScraper.fetch_match_name(match_id)
        oupei_data = OddsScraper.fetch_oupei_data(match_id)
        yapan_data = OddsScraper.fetch_yapan_data(match_id)
        daxiao_data = OddsScraper.fetch_daxiao_data(match_id)

        return jsonify(
            {
                "id": match_id,
                "name": match_name,
                "oupei": oupei_data,
                "yapan": yapan_data,
                "daxiao": daxiao_data,
            }
        )
    except Exception as e:
        logger.error(f"获取所有赔率数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/odds/oupei/<match_id>")
def api_get_oupei(match_id):
    """
    API接口：获取欧赔数据
    """
    try:
        data = OddsScraper.fetch_oupei_data(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取欧赔数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/odds/yapan/<match_id>")
def api_get_yapan(match_id):
    """
    API接口：获取亚盘数据
    """
    try:
        data = OddsScraper.fetch_yapan_data(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取亚盘数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/odds/daxiao/<match_id>")
def api_get_daxiao(match_id):
    """
    API接口：获取大小球数据
    """
    try:
        data = OddsScraper.fetch_daxiao_data(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取大小球数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/odds/average/<match_id>")
def api_get_average_data(match_id):
    """
    API接口：获取平均数据
    """
    try:
        data = OddsScraper.fetch_average_data(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取平均数据失败: {e}")
        return jsonify({"error": str(e)}), 500

@api_bp.route("/odds/head-to-head/<match_id>")
def api_get_head_to_head_data(match_id):
    """
    API接口：获取两队交战历史数据
    """
    try:
        data = OddsScraper.fetch_head_to_head_data(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取两队交战历史数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/odds/recent-records/<match_id>")
def api_get_recent_records(match_id):
    """
    API接口：获取两队近期战绩数据
    """
    try:
        data = OddsScraper.fetch_recent_records(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取两队近期战绩数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/odds/home-away-records/<match_id>")
def api_get_home_away_records(match_id):
    """
    API接口：获取两队区分主客场的近期战绩数据
    """
    try:
        data = OddsScraper.fetch_home_away_records(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取两队区分主客场的近期战绩数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/standings/<sid>")
def api_get_standings(sid):
    """
    API接口：获取联赛积分榜数据
    """
    try:
        # 使用StandingsScraper获取动态数据
        data = StandingsScraper.fetch_standings_data(sid)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取联赛积分榜数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/league-average/<sid>")
def api_get_league_average(sid):
    """
    API接口：获取联赛平均数据
    """
    try:
        # 使用StandingsScraper获取动态数据
        data = StandingsScraper.fetch_league_average_data(sid)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取联赛平均数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/match-process/<match_id>")
def api_get_match_process(match_id):
    """
    API接口：获取比赛进程数据
    """
    try:
        data = OddsScraper.fetch_match_process(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取比赛进程数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/players/<match_id>")
def api_get_players(match_id):
    """
    API接口：获取球员名单数据
    """
    try:
        data = OddsScraper.fetch_players(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取球员名单数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/tech-stats/<match_id>")
def api_get_tech_stats(match_id):
    """
    API接口：获取技术统计数据
    """
    try:
        data = OddsScraper.fetch_tech_stats(match_id)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取技术统计数据失败: {e}")
        return jsonify({"error": str(e)}), 500


@api_bp.route("/match-details/<fid>")
def api_get_match_details(fid):
    """
    API接口：获取比赛详情，包括球员名单和比赛进程
    """
    try:
        data = MatchScraper.fetch_match_details(fid)
        return jsonify(data)
    except Exception as e:
        logger.error(f"获取比赛详情失败: {e}")
        return jsonify({"error": str(e)}), 500
