# 日志配置模块
# 提供统一的日志记录功能

import logging
import logging.config

# 日志配置 - 适配FC环境，只使用控制台输出
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"},
        "detailed": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(lineno)d - %(message)s"
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "detailed",
        },
    },
    "loggers": {
        "scraper": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        "api": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        "main": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
    },
    "root": {"level": "ERROR", "handlers": ["console"]},
}

# 配置日志
logging.config.dictConfig(LOGGING_CONFIG)


# 创建日志记录器
def get_logger(name):
    """
    获取日志记录器

    Args:
        name: 日志记录器名称

    Returns:
        logging.Logger: 日志记录器实例
    """
    return logging.getLogger(name)
