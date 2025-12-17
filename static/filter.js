// 比赛列表筛选功能模块
// 提供比赛列表的筛选、排序和领先队伍标记功能

const filterModule = {
    // 防抖定时器
    debounceTimer: null,
    
    /**
     * 初始化筛选功能
     */
    init() {
        // 初始化联赛筛选选项
        this.initLeagueFilter();
        // 更新领先队伍的横条
        this.updateLeaderBars();
        // 添加筛选事件监听器
        this.addFilterEventListeners();
        // 恢复保存的筛选条件
        this.restoreFilters();
    },

    /**
     * 初始化联赛筛选选项
     */
    initLeagueFilter() {
        const leagueFilter = document.getElementById('leagueFilter');
        const rows = document.querySelectorAll('#matchTableBody tr');
        const leagues = new Set();
        
        rows.forEach(row => {
            const leagueCell = row.cells[0];
            // 克隆联赛单元格，移除竞彩标识span，获取纯联赛名
            const clonedCell = leagueCell.cloneNode(true);
            const jcMark = clonedCell.querySelector('.jc-mark');
            if (jcMark) {
                jcMark.remove();
            }
            const leagueName = clonedCell.textContent.trim();
            leagues.add(leagueName);
        });
        
        // 将Set转换为数组并按照字母顺序排序
        const sortedLeagues = Array.from(leagues).sort((a, b) => a.localeCompare(b));
        
        sortedLeagues.forEach(league => {
            const option = document.createElement('option');
            option.value = league;
            option.textContent = league;
            leagueFilter.appendChild(option);
        });
    },
    
    /**
     * 更新领先队伍的标识
     */
    updateLeaderBars() {
        const rows = document.querySelectorAll('#matchTableBody tr');
        
        rows.forEach(row => {
            // 获取球队单元格和比分信息
            const homeTeamCell = row.cells[4]; // 主队是第4列
            const awayTeamCell = row.cells[6]; // 客队是第6列
            const scoreCell = row.cells[5]; // 比分是第5列
            
            // 清除之前的领先标记
            homeTeamCell.classList.remove('team-leader', 'leader-big', 'leader-huge');
            awayTeamCell.classList.remove('team-leader', 'leader-big', 'leader-huge');
            
            // 获取完整时间比分
            const fullTimeScore = scoreCell.querySelector('.full-time-score');
            if (fullTimeScore) {
                const scoreText = fullTimeScore.textContent;
                const scoreParts = scoreText.split(' - ');
                if (scoreParts.length === 2) {
                    const homeScore = parseInt(scoreParts[0]);
                    const awayScore = parseInt(scoreParts[1]);
                    
                    // 计算领先优势
                    const homeAdvantage = homeScore - awayScore;
                    const awayAdvantage = awayScore - homeScore;
                    
                    // 根据领先优势添加不同的样式类
                    if (homeAdvantage > 0) {
                        homeTeamCell.classList.add('team-leader');
                        if (homeAdvantage >= 3) {
                            homeTeamCell.classList.add('leader-huge'); // 3球以上巨大优势
                        } else if (homeAdvantage >= 2) {
                            homeTeamCell.classList.add('leader-big'); // 2球较大优势
                        }
                    } else if (awayAdvantage > 0) {
                        awayTeamCell.classList.add('team-leader');
                        if (awayAdvantage >= 3) {
                            awayTeamCell.classList.add('leader-huge'); // 3球以上巨大优势
                        } else if (awayAdvantage >= 2) {
                            awayTeamCell.classList.add('leader-big'); // 2球较大优势
                        }
                    }
                    // 平局不添加标记
                }
            }
        });
    },
    
    /**
     * 筛选表格数据
     */
    filterTable() {
        const leagueFilter = document.getElementById('leagueFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const teamFilter = document.getElementById('teamFilter').value;
        const jcFilter = document.getElementById('jcFilter').checked;
        
        const rows = document.querySelectorAll('#matchTableBody tr');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const cells = row.cells;
            // 克隆联赛单元格，移除竞彩标识span，获取纯联赛名用于筛选
            const clonedLeagueCell = cells[0].cloneNode(true);
            const jcMark = clonedLeagueCell.querySelector('.jc-mark');
            if (jcMark) {
                jcMark.remove();
            }
            const league = clonedLeagueCell.textContent.trim().toLowerCase();
            const status = cells[3].textContent.toLowerCase(); // 状态是第3列
            const homeTeam = cells[4].textContent.toLowerCase(); // 主队是第4列
            const awayTeam = cells[6].textContent.toLowerCase(); // 客队是第6列
            // 检查是否为竞彩比赛
            const isJcMatch = row.querySelector('.jc-mark') !== null;
            
            const isVisible = (
                (leagueFilter === '' || league.includes(leagueFilter.toLowerCase())) &&
                (statusFilter === '' || status.includes(statusFilter.toLowerCase())) &&
                (teamFilter === '' || homeTeam.includes(teamFilter.toLowerCase()) || awayTeam.includes(teamFilter.toLowerCase())) &&
                (!jcFilter || isJcMatch)
            );
            
            row.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                visibleCount++;
            }
        });
        
        // 更新领先队伍的横条
        this.updateLeaderBars();
        
        // 更新筛选状态显示
        this.updateFilterStatus(leagueFilter, statusFilter, teamFilter, jcFilter, visibleCount);
        
        // 保存筛选条件
        this.saveFilters();
    },
    
    /**
     * 添加筛选事件监听器
     */
    addFilterEventListeners() {
        document.getElementById('leagueFilter').addEventListener('change', () => this.filterTable());
        document.getElementById('statusFilter').addEventListener('change', () => this.filterTable());
        // 为球队搜索添加防抖
        document.getElementById('teamFilter').addEventListener('input', () => this.debounceFilter());
        document.getElementById('jcFilter').addEventListener('change', () => this.filterTable());
        
        // 添加日期筛选事件监听器
        document.getElementById('dateSearchBtn').addEventListener('click', () => this.searchByDate());
        document.getElementById('dateFilter').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchByDate();
            }
        });
        
        // 添加刷新按钮事件监听器
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());
        
        // 添加清除筛选按钮事件监听器
        document.getElementById('clearFilterBtn').addEventListener('click', () => this.clearFilters());
    },
    
    /**
     * 防抖筛选函数
     */
    debounceFilter() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.filterTable();
        }, 300); // 300ms防抖延迟
    },
    
    /**
     * 更新筛选状态显示
     */
    updateFilterStatus(league, status, team, jc, count) {
        const activeFilters = [];
        
        if (league) {
            activeFilters.push(`联赛：${league}`);
        }
        if (status) {
            activeFilters.push(`状态：${status}`);
        }
        if (team) {
            activeFilters.push(`球队：${team}`);
        }
        if (jc) {
            activeFilters.push('竞彩比赛');
        }
        
        const statusElement = document.getElementById('activeFilters');
        if (activeFilters.length > 0) {
            statusElement.innerHTML = `${activeFilters.join('，')} - 共${count}场比赛`;
        } else {
            statusElement.textContent = `无筛选条件 - 共${count}场比赛`;
        }
    },
    
    /**
     * 保存筛选条件到localStorage
     */
    saveFilters() {
        const filters = {
            league: document.getElementById('leagueFilter').value,
            status: document.getElementById('statusFilter').value,
            team: document.getElementById('teamFilter').value,
            jc: document.getElementById('jcFilter').checked
        };
        localStorage.setItem('footballFilters', JSON.stringify(filters));
    },
    
    /**
     * 从localStorage恢复筛选条件
     */
    restoreFilters() {
        const savedFilters = localStorage.getItem('footballFilters');
        if (savedFilters) {
            try {
                const filters = JSON.parse(savedFilters);
                document.getElementById('leagueFilter').value = filters.league || '';
                document.getElementById('statusFilter').value = filters.status || '';
                document.getElementById('teamFilter').value = filters.team || '';
                document.getElementById('jcFilter').checked = filters.jc || false;
                
                // 应用筛选条件
                this.filterTable();
            } catch (e) {
                console.error('恢复筛选条件失败:', e);
            }
        }
    },
    
    /**
     * 根据日期查询比赛
     */
    searchByDate() {
        const dateFilter = document.getElementById('dateFilter');
        const date = dateFilter.value;
        
        if (date) {
            // 构建带日期参数的URL
            const url = new URL(window.location.href);
            url.searchParams.set('date', date);
            // 跳转到带日期参数的页面
            window.location.href = url.toString();
        } else {
            // 如果日期为空，跳转到默认页面（无日期参数）
            const url = new URL(window.location.href);
            url.searchParams.delete('date');
            window.location.href = url.toString();
        }
    },
    
    /**
     * 刷新比赛数据
     */
    refreshData() {
        // 显示刷新状态
        const refreshBtn = document.getElementById('refreshBtn');
        const originalText = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '🔄 刷新中...';
        refreshBtn.disabled = true;
        
        // 模拟数据刷新（实际项目中这里会调用API获取最新数据）
        setTimeout(() => {
            // 重置比赛列表（实际项目中这里会重新渲染表格）
            this.filterTable();
            this.initLeagueFilter();
            this.updateLeaderBars();
            
            // 恢复按钮状态
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            

        }, 1000);
    },
    
    /**
     * 清除所有筛选条件
     */
    clearFilters() {
        // 重置所有筛选控件
        document.getElementById('dateFilter').value = '';
        document.getElementById('leagueFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('teamFilter').value = '';
        document.getElementById('jcFilter').checked = false;
        
        // 清除localStorage中的筛选条件
        localStorage.removeItem('footballFilters');
        
        // 重新筛选表格
        this.filterTable();
        
        // 重置日期筛选，跳转到默认页面
        const url = new URL(window.location.href);
        url.searchParams.delete('date');
        window.location.href = url.toString();
    }
};

// 暴露模块接口
if (typeof window !== 'undefined') {
    window.filterModule = filterModule;
}