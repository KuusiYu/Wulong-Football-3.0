// 赔率数据获取功能模块
// 提供从500.com获取欧赔、亚盘和大小球数据的功能

// 定义模块接口
const oddsDataModule = {
    /**
     * 获取单个比赛的所有赔率数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 包含所有赔率数据的对象
     */
    async fetchAllOddsData(matchId) {
        try {
            // 使用后端代理接口避免跨域问题
            const response = await fetch(`/api/odds/${matchId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取赔率数据失败:', error);
            throw error;
        }
    },
    
    /**
     * 获取欧赔数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object|null>} 欧赔数据对象或null
     */
    async fetchOupeiData(matchId) {
        try {
            const response = await fetch(`/api/odds/oupei/${matchId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取欧赔数据失败:', error);
            return null;
        }
    },
    
    /**
     * 获取亚盘数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object|null>} 亚盘数据对象或null
     */
    async fetchYapanData(matchId) {
        try {
            const response = await fetch(`/api/odds/yapan/${matchId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取亚盘数据失败:', error);
            return null;
        }
    },
    
    /**
     * 获取大小球数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object|null>} 大小球数据对象或null
     */
    async fetchDaxiaoData(matchId) {
        try {
            const response = await fetch(`/api/odds/daxiao/${matchId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取大小球数据失败:', error);
            return null;
        }
    }
};

// 暴露模块接口
if (typeof module !== 'undefined' && module.exports) {
    // Node.js环境
    module.exports = oddsDataModule;
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.oddsDataModule = oddsDataModule;
} else {
    // 其他环境
    console.error('不支持的运行环境');
}