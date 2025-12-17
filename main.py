from flask import Flask, render_template, request

from api import api_bp
from logger import get_logger
from scraper import MatchScraper

# 创建日志记录器
logger = get_logger("main")

# 创建Flask应用实例
app = Flask(__name__)

# 注册API蓝图
app.register_blueprint(api_bp)


@app.route("/")
def index():
    """
    主页路由：获取直播比赛列表或历史比赛列表并渲染模板
    """
    try:
        # 获取日期参数
        date = request.args.get("date")
        
        # 使用MatchScraper类获取比赛数据
        match_list = MatchScraper.fetch_live_matches(date)
        return render_template("index.html", matches=match_list, current_date=date)
    except Exception as e:
        logger.error(f"获取比赛列表失败: {e}")
        return render_template("index.html", matches=[])


if __name__ == "__main__":
    app.run(debug=True)
