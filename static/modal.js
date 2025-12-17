// 赔率模态框功能模块
// 提供赔率模态框的显示、隐藏、数据加载和渲染功能

const modalModule = {
    // 当前选中的比赛ID
    currentMatchId: null,
    
    // 模态框元素
    modal: null,
    closeBtn: null,
    loadingIndicator: null,
    errorMessage: null,
    oddsContent: null,
    retryBtn: null,
    modalTitle: null,
    
    // 标签页元素
    tabBtns: null,
    tabPanes: null,
    
    // 赔率表格
    oupeiTable: null,
    yapanTable: null,
    daxiaoTable: null,
    


    /**
     * 初始化模态框功能
     */
    init() {
        // 获取模态框相关元素
        this.modal = document.getElementById('oddsModal');
        this.closeBtn = document.querySelector('.close-btn');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.oddsContent = document.getElementById('oddsContent');
        this.retryBtn = document.getElementById('retryBtn');
        this.modalTitle = document.getElementById('modalTitle');
        
        // 获取赔率表格
        this.oupeiTable = document.getElementById('oupeiTable').querySelector('tbody');
        this.yapanTable = document.getElementById('yapanTable').querySelector('tbody');
        this.daxiaoTable = document.getElementById('daxiaoTable').querySelector('tbody');
        
        // 获取标签页元素
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        
        // 添加事件监听器
        this.addEventListeners();
        
        // 初始化赔率内部标签页
        this.initOddsTabs();
    },
    
    /**
     * 添加事件监听器
     */
    addEventListeners() {
        // 为详情按钮添加点击事件监听器
        this.addDetailsBtnListeners();
        
        // 点击关闭按钮
        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        // 点击模态框外部区域关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // 重试按钮点击事件
        this.retryBtn.addEventListener('click', () => {
            if (this.currentMatchId) {
                this.fetchAndDisplayOdds(this.currentMatchId);
            }
        });
        
        // 标签页点击事件
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    },
    
    /**
     * 初始化赔率内部标签页
     */
    initOddsTabs() {
        // 添加赔率内部标签页切换事件
        this.modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('odds-tab-btn')) {
                const targetTab = e.target.getAttribute('data-odds-tab');
                this.switchOddsTab(targetTab);
            }
            // 添加子标签切换事件
            else if (e.target.classList.contains('sub-tab-btn')) {
                const targetTab = e.target.getAttribute('data-sub-tab');
                this.switchSubTab(targetTab);
            }
        });
    },
    
    /**
     * 切换子标签
     */
    switchSubTab(tabName) {
        // 移除所有子标签按钮的激活状态
        const subTabBtns = this.modal.querySelectorAll('.sub-tab-btn');
        subTabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 隐藏所有子标签内容
        const subTabPanes = this.modal.querySelectorAll('.sub-tab-pane');
        subTabPanes.forEach(pane => {
            pane.classList.remove('active');
        });
        
        // 激活当前子标签按钮和内容
        const targetBtn = this.modal.querySelector(`[data-sub-tab="${tabName}"]`);
        const targetPane = this.modal.querySelector(`#${tabName}`);
        
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        if (targetPane) {
            targetPane.classList.add('active');
        }
        
        // 如果切换到智能分析标签页，重新生成推荐文
        if (tabName === 'smart-analysis' && typeof generateAIRecommendation === 'function') {
            generateAIRecommendation();
        }
    },
    
    /**
     * 切换赔率内部标签页
     */
    switchOddsTab(tabName) {
        // 移除所有赔率标签页按钮的激活状态
        const oddsTabBtns = document.querySelectorAll('.odds-tab-btn');
        oddsTabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 隐藏所有赔率标签页内容
        const oddsTabContents = document.querySelectorAll('.odds-tab-content');
        oddsTabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // 激活当前赔率标签页按钮和内容
        const targetBtn = document.querySelector(`[data-odds-tab="${tabName}"]`);
        const targetContent = document.getElementById(`${tabName}TabContent`);
        
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        if (targetContent) {
            targetContent.classList.add('active');
        }
    },
    
    /**
     * 为详情按钮添加点击事件监听器
     */
    addDetailsBtnListeners() {
        const detailsBtns = document.querySelectorAll('.details-btn');
        detailsBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const matchId = this.getAttribute('data-fid');
                const sid = this.getAttribute('data-sid');
                const league = this.getAttribute('data-league');
                const round = this.getAttribute('data-round');
                const matchTime = this.getAttribute('data-match-time');
                const homeTeam = this.getAttribute('data-home-team');
                const awayTeam = this.getAttribute('data-away-team');
                const homeTeamLogo = this.getAttribute('data-home-team-logo');
                const awayTeamLogo = this.getAttribute('data-away-team-logo');
                
                if (matchId) {
                    modalModule.modal.style.display = 'block';
                    modalModule.fetchAndDisplayOdds(matchId, sid, { homeTeam, awayTeam, homeTeamLogo, awayTeamLogo, league, round, time: matchTime });
                }
            });
        });
    },
    
    /**
     * 切换标签页
     */
    switchTab(tabName) {
        // 移除所有标签页按钮的激活状态
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 隐藏所有标签页内容
        this.tabPanes.forEach(pane => {
            pane.classList.remove('active');
        });
        
        // 激活当前标签页按钮和内容
        const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const targetPane = document.getElementById(tabName);
        
        if (targetBtn) {
            targetBtn.classList.add('active');
        }
        
        if (targetPane) {
            targetPane.classList.add('active');
        }
        
        // 如果切换到进程标签页，获取并渲染比赛进程和球员名单数据
        if (tabName === 'process' && this.currentMatchId && window.matchDataModule) {
            this.fetchAndRenderProcessData(this.currentMatchId);
        }
    },
    
    /**
     * 获取并渲染比赛进程、技术统计和球员名单数据
     */
    async fetchAndRenderProcessData(matchId) {
        if (window.matchDataModule) {
            // 获取并渲染比赛进程数据
            const matchProcessData = await matchDataModule.fetchMatchProcessData(matchId);
            matchDataModule.renderMatchProcessData(matchProcessData);
            
            // 获取并渲染技术统计数据
            const techStatsData = await matchDataModule.fetchTechStatsData(matchId);
            // 使用当前比赛信息中的球队名称
            const homeTeam = this.currentMatchInfo ? this.currentMatchInfo.homeTeam : '';
            const awayTeam = this.currentMatchInfo ? this.currentMatchInfo.awayTeam : '';
            matchDataModule.renderTechStatsData(techStatsData, homeTeam, awayTeam);
            
            // 获取并渲染球员名单数据
            const playersData = await matchDataModule.fetchPlayersData(matchId);
            matchDataModule.renderPlayersData(playersData);
        }
    },
    
    /**
     * 处理盘口数据：移除箭头
     */
    removeArrows(text) {
        return text.replace(/[↑↓]/g, '');
    },
    
    /**
     * 将盘口格式转换为标准小数（如2.5/3转换为2.75）
     */
    convertHandicapToDecimal(handicap) {
        // 先移除箭头
        handicap = this.removeArrows(handicap);
        
        // 检查是否包含斜杠
        if (handicap.includes('/')) {
            const parts = handicap.split('/');
            if (parts.length === 2) {
                const num1 = parseFloat(parts[0]);
                const num2 = parseFloat(parts[1]);
                if (!isNaN(num1) && !isNaN(num2)) {
                    return ((num1 + num2) / 2).toFixed(2);
                }
            }
        }
        
        // 如果没有斜杠或转换失败，直接返回原数据（已移除箭头）
        return handicap;
    },
    
    /**
     * 将汉字盘口转换为标准数字格式
     */
    convertChineseHandicap(handicap) {
        // 首先删除升降二字
        let cleanHandicap = handicap.replace(/[升降]/g, '');
        
        // 检查是否有受字
        const isHomeTeamPositive = cleanHandicap.includes('受');
        
        // 移除受字
        cleanHandicap = cleanHandicap.replace('受', '');
        
        // 定义盘口转换映射
        const handicapMap = {
            '平手': 0.0,
            '平/半': 0.25,
            '平手/半球': 0.25,
            '半球': 0.5,
            '半/一': 0.75,
            '半球/一球': 0.75,
            '一球': 1.0,
            '一/球半': 1.25,
            '一球/球半': 1.25,
            '球半': 1.5,
            '球半/两球': 1.75,
            '两球': 2.0,
            '两球/两球半': 2.25,
            '两球半': 2.5,
            '两球半/三球': 2.75,
            '三球': 3.0,
            '三球/三球半': 3.25,
            '三球半': 3.5,
            '三球半/四球': 3.75,
            '四球': 4.0,
            '四球/四球半': 4.25,
            '四球半': 4.5,
            '四球半/五球': 4.75,
            '五球': 5.0
        };
        
        // 根据盘口内容转换为数字
        let numberHandicap = handicapMap[cleanHandicap];
        
        // 如果没有找到映射，返回原始数据
        if (numberHandicap === undefined) {
            return cleanHandicap;
        }
        
        // 根据是否有受字添加正负号
        // 当盘口为0.0时不显示正负号
        if (numberHandicap === 0.0) {
            return '0.00';
        } else if (isHomeTeamPositive) {
            return '+' + numberHandicap.toFixed(2);
        } else {
            return '-' + numberHandicap.toFixed(2);
        }
    },
    
    /**
     * 格式化赔率：移除箭头并确保两位小数
     */
    formatOdds(odds, isYapan = false) {
        // 首先移除箭头
        odds = this.removeArrows(odds);
        
        // 如果是亚盘，确保两位小数
        if (isYapan) {
            // 转换为数字
            const num = parseFloat(odds);
            if (!isNaN(num)) {
                // 处理-0.00的情况
                if (Math.abs(num) < 0.001) {
                    return '0.00';
                }
                return num.toFixed(2);
            }
        }
        
        return odds;
    },
    
    /**
     * 显示加载状态
     */
    showLoading() {
        this.loadingIndicator.style.display = 'block';
        this.errorMessage.style.display = 'none';
        this.oddsContent.style.display = 'none';
    },
    
    /**
     * 显示错误信息
     */
    showError() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'block';
        this.oddsContent.style.display = 'none';
    },
    
    /**
     * 显示赔率内容
     */
    showOddsContent() {
        this.loadingIndicator.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.oddsContent.style.display = 'block';
    },
    
    /**
     * 清空表格内容
     */
    clearTables() {
        this.oupeiTable.innerHTML = '';
        this.yapanTable.innerHTML = '';
        this.daxiaoTable.innerHTML = '';
    },
    
    /**
     * 填充欧赔表格
     */
    populateOupeiTable(oupeiData) {
        // 处理空数据或无效数据
        if (!oupeiData || typeof oupeiData !== 'object' || Object.keys(oupeiData).length === 0) {
            this.oupeiTable.innerHTML = '<tr><td colspan="10">暂无欧赔数据</td></tr>';
            return;
        }
        
        // 获取所有公司列表，按字母顺序排序
        const companies = Object.keys(oupeiData).sort();
        
        if (companies.length === 0) {
            this.oupeiTable.innerHTML = '<tr><td colspan="10">暂无欧赔数据</td></tr>';
            return;
        }
        
        companies.forEach(company => {
            const data = oupeiData[company];
            // 确保data、instant和initial属性存在
            if (!data || !Array.isArray(data.instant) || !Array.isArray(data.initial)) {
                console.warn(`欧赔数据格式异常: ${company}`);
                return;
            }
            
            // 计算初盘和即时盘的Margin
            let initialMargin = '-';
            let instantMargin = '-';
            
            // 计算初盘Margin
            if (data.initial[0] && data.initial[1] && data.initial[2]) {
                initialMargin = this.calculateMargin(data.initial[0], data.initial[1], data.initial[2]).toFixed(2) + '%';
            }
            
            // 计算即时盘Margin
            if (data.instant[0] && data.instant[1] && data.instant[2]) {
                instantMargin = this.calculateMargin(data.instant[0], data.instant[1], data.instant[2]).toFixed(2) + '%';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${company}</td>
                <td>${data.initial[0] || '-'}</td>
                <td>${this.convertHandicapToDecimal(data.initial[1]) || '-'}</td>
                <td>${data.initial[2] || '-'}</td>
                <td>${data.instant[0] || '-'}</td>
                <td>${this.convertHandicapToDecimal(data.instant[1]) || '-'}</td>
                <td>${data.instant[2] || '-'}</td>
                <td>${initialMargin}</td>
                <td>${instantMargin}</td>
            `;
            this.oupeiTable.appendChild(row);
        });
        
        // 添加统计行（已隐藏）
        // this.addStatsRow(this.oupeiTable);
    },
    
    /**
     * 填充亚盘表格
     */
    populateYapanTable(yapanData) {
        // 处理空数据或无效数据
        if (!yapanData || typeof yapanData !== 'object' || Object.keys(yapanData).length === 0) {
            this.yapanTable.innerHTML = '<tr><td colspan="10">暂无亚盘数据</td></tr>';
            return;
        }
        
        // 获取所有公司列表，按字母顺序排序
        const companies = Object.keys(yapanData).sort();
        
        if (companies.length === 0) {
            this.yapanTable.innerHTML = '<tr><td colspan="10">暂无亚盘数据</td></tr>';
            return;
        }
        
        companies.forEach(company => {
            const data = yapanData[company];
            // 确保data、instant和initial属性存在
            if (!data || !Array.isArray(data.instant) || !Array.isArray(data.initial)) {
                console.warn(`亚盘数据格式异常: ${company}`);
                return;
            }
            
            // 计算初盘和即时盘的Margin
            let initialMargin = '-';
            let instantMargin = '-';
            
            // 计算初盘Margin
            if (data.initial[0] && data.initial[2]) {
                initialMargin = this.calculateTwoOptionMargin(data.initial[0], data.initial[2]).toFixed(2) + '%';
            }
            
            // 计算即时盘Margin
            if (data.instant[0] && data.instant[2]) {
                instantMargin = this.calculateTwoOptionMargin(data.instant[0], data.instant[2]).toFixed(2) + '%';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${company}</td>
                <td>${this.formatOdds(data.initial[0], true) || '-'}</td>
                <td>${this.convertHandicapToDecimal(this.convertChineseHandicap(data.initial[1])) || '-'}</td>
                <td>${this.formatOdds(data.initial[2], true) || '-'}</td>
                <td>${this.formatOdds(data.instant[0], true) || '-'}</td>
                <td>${this.convertHandicapToDecimal(this.convertChineseHandicap(data.instant[1])) || '-'}</td>
                <td>${this.formatOdds(data.instant[2], true) || '-'}</td>
                <td>${initialMargin}</td>
                <td>${instantMargin}</td>
            `;
            this.yapanTable.appendChild(row);
        });
        
        // 添加统计行（已隐藏）
        // this.addStatsRow(this.yapanTable);
    },
    
    /**
     * 计算统计数据
     */
    calculateStats(values) {
        const count = values.length;
        if (count === 0) return { avg: 0, max: 0, min: 0, stdDev: 0 };
        
        const sum = values.reduce((acc, val) => acc + val, 0);
        const avg = sum / count;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        // 计算标准差
        const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / count;
        const stdDev = Math.sqrt(variance);
        
        return { avg, max, min, stdDev };
    },
    
    /**
     * 计算隐含概率（包含本金1）
     */
    calculateImpliedProbability(odds) {
        return 1 / parseFloat(odds);
    },
    
    /**
     * 计算隐含概率（不包含本金1，适用于亚盘和大小球）
     */
    calculateImpliedProbabilityNoPrincipal(odds) {
        return 1 / (parseFloat(odds) + 1);
    },
    
    /**
     * 计算欧赔Margin（庄家抽水率）
     */
    calculateMargin(winOdds, drawOdds, loseOdds) {
        const winImplied = this.calculateImpliedProbability(winOdds);
        const drawImplied = this.calculateImpliedProbability(drawOdds);
        const loseImplied = this.calculateImpliedProbability(loseOdds);
        
        const totalImplied = winImplied + drawImplied + loseImplied;
        const margin = (totalImplied - 1) * 100;
        
        return margin;
    },
    
    /**
     * 计算两选项Margin（亚盘、大小球）
     */
    calculateTwoOptionMargin(option1Odds, option2Odds) {
        const option1Implied = this.calculateImpliedProbabilityNoPrincipal(option1Odds);
        const option2Implied = this.calculateImpliedProbabilityNoPrincipal(option2Odds);
        
        const totalImplied = option1Implied + option2Implied;
        const margin = (totalImplied - 1) * 100;
        
        return margin;
    },
    
    /**
     * 计算公平概率（支持三选项和两选项）
     */
    calculateFairProbability(option1Odds, option2Odds, option3Odds = 0) {
        let option1Implied, option2Implied, option3Implied, totalImplied;
        
        if (option3Odds === 0) {
            // 两选项情况（亚盘、大小球）
            option1Implied = this.calculateImpliedProbability(option1Odds);
            option2Implied = this.calculateImpliedProbability(option2Odds);
            totalImplied = option1Implied + option2Implied;
            
            return {
                win: (option1Implied / totalImplied) * 100,
                lose: (option2Implied / totalImplied) * 100
            };
        } else {
            // 三选项情况（欧赔）
            option1Implied = this.calculateImpliedProbability(option1Odds);
            option2Implied = this.calculateImpliedProbability(option2Odds);
            option3Implied = this.calculateImpliedProbability(option3Odds);
            totalImplied = option1Implied + option2Implied + option3Implied;
            
            return {
                win: (option1Implied / totalImplied) * 100,
                draw: (option2Implied / totalImplied) * 100,
                lose: (option3Implied / totalImplied) * 100
            };
        }
    },
    


    /**
     * 为表格添加统计行
     */
    addStatsRow(tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        if (rows.length === 0) return;
        
        const columns = rows[0].querySelectorAll('td').length;
        const stats = [];
        
        // 收集每列的数值并计算统计数据（从第1列开始，跳过第0列的公司名称）
        for (let col = 1; col < columns; col++) {
            const values = [];
            for (let row of rows) {
                const cell = row.querySelectorAll('td')[col];
                const value = parseFloat(cell.textContent);
                if (!isNaN(value)) {
                    values.push(value);
                }
            }
            stats.push(this.calculateStats(values));
        }
        
        // 创建统计行
        const statsRow = document.createElement('tr');
        statsRow.className = 'stats-row';
        statsRow.style.backgroundColor = '#f5f5f5';
        statsRow.style.fontWeight = 'bold';
        statsRow.style.borderTop = '2px solid #333';
        
        // 第一列：统计标签
        const firstCell = document.createElement('td');
        firstCell.textContent = '统计';
        firstCell.style.textAlign = 'center';
        statsRow.appendChild(firstCell);
        
        // 添加各列的统计数据
        stats.forEach((stat, index) => {
            const cell = document.createElement('td');
            cell.innerHTML = `
                平均: ${stat.avg.toFixed(2)}<br>
                最大: ${stat.max.toFixed(2)}<br>
                最小: ${stat.min.toFixed(2)}<br>
                离散: ${stat.stdDev.toFixed(2)}
            `;
            cell.style.textAlign = 'center';
            cell.style.padding = '8px 4px';
            cell.style.borderLeft = '1px solid #ddd';
            statsRow.appendChild(cell);
        });
        
        tableBody.appendChild(statsRow);
    },

    /**
     * 填充大小球表格
     */
    populateDaxiaoTable(daxiaoData) {
        // 处理空数据或无效数据
        if (!daxiaoData || typeof daxiaoData !== 'object' || Object.keys(daxiaoData).length === 0) {
            this.daxiaoTable.innerHTML = '<tr><td colspan="10">暂无大小球数据</td></tr>';
            return;
        }
        
        // 获取所有公司列表，按字母顺序排序
        const companies = Object.keys(daxiaoData).sort();
        
        if (companies.length === 0) {
            this.daxiaoTable.innerHTML = '<tr><td colspan="10">暂无大小球数据</td></tr>';
            return;
        }
        
        companies.forEach(company => {
            const data = daxiaoData[company];
            // 确保data、instant和initial属性存在
            if (!data || !Array.isArray(data.instant) || !Array.isArray(data.initial)) {
                console.warn(`大小球数据格式异常: ${company}`);
                return;
            }
            
            // 计算初盘和即时盘的Margin
            let initialMargin = '-';
            let instantMargin = '-';
            
            // 计算初盘Margin
            if (data.initial[0] && data.initial[2]) {
                initialMargin = this.calculateTwoOptionMargin(data.initial[0], data.initial[2]).toFixed(2) + '%';
            }
            
            // 计算即时盘Margin
            if (data.instant[0] && data.instant[2]) {
                instantMargin = this.calculateTwoOptionMargin(data.instant[0], data.instant[2]).toFixed(2) + '%';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${company}</td>
                <td>${this.formatOdds(data.initial[0]) || '-'}</td>
                <td>${this.convertHandicapToDecimal(data.initial[1]) || '-'}</td>
                <td>${this.formatOdds(data.initial[2]) || '-'}</td>
                <td>${this.formatOdds(data.instant[0]) || '-'}</td>
                <td>${this.convertHandicapToDecimal(data.instant[1]) || '-'}</td>
                <td>${this.formatOdds(data.instant[2]) || '-'}</td>
                <td>${initialMargin}</td>
                <td>${instantMargin}</td>
            `;
            this.daxiaoTable.appendChild(row);
        });
        
        // 添加统计行（已隐藏）
        // this.addStatsRow(this.daxiaoTable);
    },
    
    /**
     * 计算平均赔率
     */
    calculateAverageOdds(data, type = 'oupei') {
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            if (type === 'oupei') {
                return { initial: { win: 0, draw: 0, lose: 0 }, instant: { win: 0, draw: 0, lose: 0 } };
            } else {
                return { initial: { option1: 0, option2: 0, handicap: 0 }, instant: { option1: 0, option2: 0, handicap: 0 } };
            }
        }
        
        const companies = Object.keys(data);
        const initialOdds = [];
        const instantOdds = [];
        
        companies.forEach(company => {
            const companyData = data[company];
            if (companyData && Array.isArray(companyData.initial) && Array.isArray(companyData.instant)) {
                initialOdds.push(companyData.initial);
                instantOdds.push(companyData.instant);
            }
        });
        
        const calculateAverage = (oddsArray, index) => {
            const validOdds = oddsArray.filter(odds => {
                // 对于盘口数据，需要特殊处理汉字盘口
                if (index === 1 && (type === 'yapan' || type === 'daxiao')) {
                    // 对于亚盘，需要先转换汉字盘口为数字
                    const handicap = odds[index];
                    if (typeof handicap === 'string' && handicap.includes('半') || handicap.includes('平') || handicap.includes('一')) {
                        // 这是一个汉字盘口，需要转换
                        const converted = this.convertChineseHandicap(handicap);
                        return !isNaN(parseFloat(converted));
                    }
                }
                return !isNaN(parseFloat(odds[index]));
            }).map(odds => {
                // 对于盘口数据，需要先转换
                if (index === 1 && (type === 'yapan' || type === 'daxiao')) {
                    const handicap = odds[index];
                    if (typeof handicap === 'string') {
                        if (handicap.includes('半') || handicap.includes('平') || handicap.includes('一')) {
                            // 这是一个汉字盘口，需要转换
                            return parseFloat(this.convertChineseHandicap(handicap));
                        } else {
                            // 尝试直接转换
                            return parseFloat(handicap);
                        }
                    }
                }
                return parseFloat(odds[index]);
            });
            
            if (validOdds.length === 0) return 0;
            return validOdds.reduce((sum, odds) => sum + odds, 0) / validOdds.length;
        };
        
        if (type === 'oupei') {
            return {
                initial: {
                    win: calculateAverage(initialOdds, 0),
                    draw: calculateAverage(initialOdds, 1),
                    lose: calculateAverage(initialOdds, 2)
                },
                instant: {
                    win: calculateAverage(instantOdds, 0),
                    draw: calculateAverage(instantOdds, 1),
                    lose: calculateAverage(instantOdds, 2)
                }
            };
        } else {
            // 亚盘和大小球
            return {
                initial: {
                    option1: calculateAverage(initialOdds, 0),
                    handicap: calculateAverage(initialOdds, 1),
                    option2: calculateAverage(initialOdds, 2)
                },
                instant: {
                    option1: calculateAverage(instantOdds, 0),
                    handicap: calculateAverage(instantOdds, 1),
                    option2: calculateAverage(instantOdds, 2)
                }
            };
        }
    },
    
    /**
     * 渲染分析数据
     */
    renderAnalysis(oddsData) {
        const { oupei, yapan, daxiao } = oddsData;
        
        // 渲染欧赔分析
        this.renderOupeiAnalysis(oupei);
        
        // 渲染亚盘分析
        this.renderYapanAnalysis(yapan);
        
        // 渲染大小球分析
        this.renderDaxiaoAnalysis(daxiao);
        
        // 渲染推荐投注项目
        this.renderBetRecommendations(oddsData);
    },
    
    /**
     * 渲染欧赔分析数据
     */
    renderOupeiAnalysis(oupeiData) {
        if (!oupeiData || typeof oupeiData !== 'object' || Object.keys(oupeiData).length === 0) {
            document.getElementById('oupeiStats').innerHTML = '<p>暂无欧赔数据</p>';
            return;
        }
        
        // 计算平均赔率
        const avgOdds = this.calculateAverageOdds(oupeiData, 'oupei');
        
        // 计算初始赔率和即时赔率的Margin
        const initialMargin = this.calculateMargin(avgOdds.initial.win, avgOdds.initial.draw, avgOdds.initial.lose);
        const instantMargin = this.calculateMargin(avgOdds.instant.win, avgOdds.instant.draw, avgOdds.instant.lose);
        
        // 计算公平概率
        const initialFairProb = this.calculateFairProbability(avgOdds.initial.win, avgOdds.initial.draw, avgOdds.initial.lose);
        const instantFairProb = this.calculateFairProbability(avgOdds.instant.win, avgOdds.instant.draw, avgOdds.instant.lose);
        
        // 渲染欧赔统计
        document.getElementById('oupeiStats').innerHTML = `
            <div class="stats-row">
                <div class="stats-label">平均初盘赔率</div>
                <div class="stats-value">主胜: ${avgOdds.initial.win.toFixed(2)} | 平局: ${avgOdds.initial.draw.toFixed(2)} | 客胜: ${avgOdds.initial.lose.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">平均即时赔率</div>
                <div class="stats-value">主胜: ${avgOdds.instant.win.toFixed(2)} | 平局: ${avgOdds.instant.draw.toFixed(2)} | 客胜: ${avgOdds.instant.lose.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">欧赔初盘Margin</div>
                <div class="stats-value">${initialMargin.toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">欧赔即时Margin</div>
                <div class="stats-value">${instantMargin.toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">欧赔Margin变化</div>
                <div class="stats-value">${(instantMargin - initialMargin).toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">初盘公平概率</div>
                <div class="stats-value">主胜: ${initialFairProb.win.toFixed(1)}% | 平局: ${initialFairProb.draw.toFixed(1)}% | 客胜: ${initialFairProb.lose.toFixed(1)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">即时公平概率</div>
                <div class="stats-value">主胜: ${instantFairProb.win.toFixed(1)}% | 平局: ${instantFairProb.draw.toFixed(1)}% | 客胜: ${instantFairProb.lose.toFixed(1)}%</div>
            </div>
        `;
    },
    
    /**
     * 渲染亚盘分析数据
     */
    renderYapanAnalysis(yapanData) {
        if (!yapanData || typeof yapanData !== 'object' || Object.keys(yapanData).length === 0) {
            document.getElementById('marginStats').innerHTML = '<p>暂无亚盘数据</p>';
            return;
        }
        
        // 计算平均赔率
        const avgOdds = this.calculateAverageOdds(yapanData, 'yapan');
        
        // 计算初始赔率和即时赔率的Margin
        const initialMargin = this.calculateTwoOptionMargin(avgOdds.initial.option1, avgOdds.initial.option2);
        const instantMargin = this.calculateTwoOptionMargin(avgOdds.instant.option1, avgOdds.instant.option2);
        
        // 计算公平概率（亚盘的公平概率基于上下盘赔率）
        const initialFairProb = this.calculateFairProbability(avgOdds.initial.option1, avgOdds.initial.option2);
        const instantFairProb = this.calculateFairProbability(avgOdds.instant.option1, avgOdds.instant.option2);
        
        // 渲染亚玩法统计
        document.getElementById('marginStats').innerHTML = `
            <div class="stats-row">
                <div class="stats-label">平均初值赔率</div>
                <div class="stats-value">主队: ${avgOdds.initial.option1.toFixed(2)} | 客队: ${avgOdds.initial.option2.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">平均即时赔率</div>
                <div class="stats-value">主队: ${avgOdds.instant.option1.toFixed(2)} | 客队: ${avgOdds.instant.option2.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">亚玩法初值Margin</div>
                <div class="stats-value">${initialMargin.toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">亚玩法即时Margin</div>
                <div class="stats-value">${instantMargin.toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">亚玩法Margin变化</div>
                <div class="stats-value">${(instantMargin - initialMargin).toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">平均初值玩法</div>
                <div class="stats-value">${avgOdds.initial.handicap.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">平均即时玩法</div>
                <div class="stats-value">${avgOdds.instant.handicap.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">初值公平概率</div>
                <div class="stats-value">主队: ${initialFairProb.win.toFixed(1)}% | 客队: ${initialFairProb.lose.toFixed(1)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">即时公平概率</div>
                <div class="stats-value">主队: ${instantFairProb.win.toFixed(1)}% | 客队: ${instantFairProb.lose.toFixed(1)}%</div>
            </div>
        `;
    },
    
    /**
     * 生成推荐投注项目
     */
    generateBetRecommendations(oddsData) {
        const { oupei, yapan, daxiao } = oddsData;
        const recommendations = [];
        
        // 大小球推荐逻辑
        if (daxiao && Object.keys(daxiao).length > 0) {
            const avgOdds = this.calculateAverageOdds(daxiao, 'daxiao');
            const initialMargin = this.calculateTwoOptionMargin(avgOdds.initial.option1, avgOdds.initial.option2);
            const instantMargin = this.calculateTwoOptionMargin(avgOdds.instant.option1, avgOdds.instant.option2);
            
            // 基于赔率变化和盘口变化生成推荐
            let daxiaoRecommendation = '';
            let daxiaoReason = '';
            
            // 赔率变化分析
            if (avgOdds.instant.option1 < avgOdds.initial.option1 && avgOdds.instant.handicap > avgOdds.initial.handicap) {
                daxiaoRecommendation = '大球';
                daxiaoReason = '大球赔率下降，盘口上升，支持大球';
            } else if (avgOdds.instant.option2 < avgOdds.initial.option2 && avgOdds.instant.handicap < avgOdds.initial.handicap) {
                daxiaoRecommendation = '小球';
                daxiaoReason = '小球赔率下降，盘口下降，支持小球';
            } else {
                daxiaoRecommendation = '观望';
                daxiaoReason = '赔率和盘口变化不明显，建议观望';
            }
            
            recommendations.push({
                type: '大小球',
                recommendation: daxiaoRecommendation,
                reason: daxiaoReason,
                currentHandicap: avgOdds.instant.handicap.toFixed(2),
                bigOdds: avgOdds.instant.option1.toFixed(2),
                smallOdds: avgOdds.instant.option2.toFixed(2),
                margin: instantMargin.toFixed(2) + '%'
            });
        }
        
        // 亚盘推荐逻辑
        if (yapan && Object.keys(yapan).length > 0) {
            const avgOdds = this.calculateAverageOdds(yapan, 'yapan');
            const instantMargin = this.calculateTwoOptionMargin(avgOdds.instant.option1, avgOdds.instant.option2);
            
            let yapanRecommendation = '';
            let yapanReason = '';
            
            // 基于盘口和赔率变化生成推荐
            if (avgOdds.instant.option1 < avgOdds.initial.option1) {
                yapanRecommendation = '主队';
                yapanReason = '主队赔率下降，支持主队';
            } else if (avgOdds.instant.option2 < avgOdds.initial.option2) {
                yapanRecommendation = '客队';
                yapanReason = '客队赔率下降，支持客队';
            } else {
                yapanRecommendation = '观望';
                yapanReason = '赔率变化不明显，建议观望';
            }
            
            recommendations.push({
                type: '亚盘',
                recommendation: yapanRecommendation,
                reason: yapanReason,
                currentHandicap: avgOdds.instant.handicap.toFixed(2),
                homeOdds: avgOdds.instant.option1.toFixed(2),
                awayOdds: avgOdds.instant.option2.toFixed(2),
                margin: instantMargin.toFixed(2) + '%'
            });
        }
        
        // 欧赔推荐逻辑
        if (oupei && Object.keys(oupei).length > 0) {
            const avgOdds = this.calculateAverageOdds(oupei, 'oupei');
            const instantMargin = this.calculateMargin(avgOdds.instant.win, avgOdds.instant.draw, avgOdds.instant.lose);
            
            let oupeiRecommendation = '';
            let oupeiReason = '';
            
            // 基于最低赔率生成推荐
            const minOdds = Math.min(avgOdds.instant.win, avgOdds.instant.draw, avgOdds.instant.lose);
            if (minOdds === avgOdds.instant.win) {
                oupeiRecommendation = '主胜';
                oupeiReason = '主胜赔率最低，支持主胜';
            } else if (minOdds === avgOdds.instant.draw) {
                oupeiRecommendation = '平局';
                oupeiReason = '平局赔率最低，支持平局';
            } else {
                oupeiRecommendation = '客胜';
                oupeiReason = '客胜赔率最低，支持客胜';
            }
            
            recommendations.push({
                type: '欧赔',
                recommendation: oupeiRecommendation,
                reason: oupeiReason,
                winOdds: avgOdds.instant.win.toFixed(2),
                drawOdds: avgOdds.instant.draw.toFixed(2),
                loseOdds: avgOdds.instant.lose.toFixed(2),
                margin: instantMargin.toFixed(2) + '%'
            });
        }
        
        return recommendations;
    },
    
    /**
     * 渲染大小球分析数据
     */
    renderDaxiaoAnalysis(daxiaoData) {
        if (!daxiaoData || typeof daxiaoData !== 'object' || Object.keys(daxiaoData).length === 0) {
            document.getElementById('daxiaoStats').innerHTML = '<p>暂无大小球数据</p>';
            return;
        }
        
        // 计算平均赔率
        const avgOdds = this.calculateAverageOdds(daxiaoData, 'daxiao');
        
        // 计算初始赔率和即时赔率的Margin
        const initialMargin = this.calculateTwoOptionMargin(avgOdds.initial.option1, avgOdds.initial.option2);
        const instantMargin = this.calculateTwoOptionMargin(avgOdds.instant.option1, avgOdds.instant.option2);
        
        // 计算公平概率（大小球的公平概率基于大小球赔率）
        const initialFairProb = this.calculateFairProbability(avgOdds.initial.option1, avgOdds.initial.option2);
        const instantFairProb = this.calculateFairProbability(avgOdds.instant.option1, avgOdds.instant.option2);
        
        // 渲染大小球统计
        document.getElementById('daxiaoStats').innerHTML = `
            <div class="stats-row">
                <div class="stats-label">平均初值赔率</div>
                <div class="stats-value">大球: ${avgOdds.initial.option1.toFixed(2)} | 小球: ${avgOdds.initial.option2.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">平均即时赔率</div>
                <div class="stats-value">大球: ${avgOdds.instant.option1.toFixed(2)} | 小球: ${avgOdds.instant.option2.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">大小球初值Margin</div>
                <div class="stats-value">${initialMargin.toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">大小球即时Margin</div>
                <div class="stats-value">${instantMargin.toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">大小球Margin变化</div>
                <div class="stats-value">${(instantMargin - initialMargin).toFixed(2)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">平均初值玩法</div>
                <div class="stats-value">${avgOdds.initial.handicap.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">平均即时玩法</div>
                <div class="stats-value">${avgOdds.instant.handicap.toFixed(2)}</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">初值公平概率</div>
                <div class="stats-value">大球: ${initialFairProb.win.toFixed(1)}% | 小球: ${initialFairProb.lose.toFixed(1)}%</div>
            </div>
            <div class="stats-row">
                <div class="stats-label">即时公平概率</div>
                <div class="stats-value">大球: ${instantFairProb.win.toFixed(1)}% | 小球: ${instantFairProb.lose.toFixed(1)}%</div>
            </div>
        `;
    },
    
    /**
     * 渲染推荐投注项目
     */
    renderBetRecommendations(oddsData) {
        const recommendations = this.generateBetRecommendations(oddsData);
        const recommendationsContainer = document.getElementById('trendAnalysis');
        
        if (recommendations.length === 0) {
            recommendationsContainer.innerHTML = '<p>暂无推荐数据</p>';
            return;
        }
        
        let html = '';
        recommendations.forEach(rec => {
            html += `
                <div class="recommendation-item">
                    <div class="recommendation-header">
                        <span class="recommendation-type">${rec.type}</span>
                        <span class="recommendation-result ${rec.recommendation === '观望' ? 'neutral' : 'positive'}">${rec.recommendation}</span>
                    </div>
                    <div class="recommendation-details">
                        <div class="recommendation-reason">${rec.reason}</div>
                        <div class="recommendation-odds">
            `;
            
            if (rec.type === '大小球') {
                html += `
                            <span>玩法: ${rec.currentHandicap}</span>
                            <span>大球: ${rec.bigOdds}</span>
                            <span>小球: ${rec.smallOdds}</span>
                `;
            } else if (rec.type === '亚盘') {
                html += `
                            <span>玩法: ${rec.currentHandicap}</span>
                            <span>主队: ${rec.homeOdds}</span>
                            <span>客队: ${rec.awayOdds}</span>
                `;
            } else {
                html += `
                            <span>主胜: ${rec.winOdds}</span>
                            <span>平局: ${rec.drawOdds}</span>
                            <span>客胜: ${rec.loseOdds}</span>
                `;
            }
            
            html += `
                            <span class="recommendation-margin">Margin: ${rec.margin}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        recommendationsContainer.innerHTML = html;
    },
    
    /**
     * 获取并展示赔率数据
     */
    async fetchAndDisplayOdds(matchId, sid, matchInfo = {}) {
        this.showLoading();
        this.clearTables();
        this.currentMatchId = matchId;
        
        // 存储比赛基本信息
        this.currentMatchInfo = {
            league: matchInfo.league || '',
            round: matchInfo.round || '',
            time: '', // 比赛时间需要从其他地方获取或默认为空
            ...matchInfo
        };
        
        try {
            // 更新模态框标题为对阵双方
            if (matchInfo.homeTeam && matchInfo.awayTeam) {
                this.modalTitle.textContent = `${matchInfo.homeTeam} - ${matchInfo.awayTeam}`;
            } else {
                // 获取赔率数据
                const oddsData = await oddsDataModule.fetchAllOddsData(matchId);
                
                // 更新模态框标题
                if (oddsData.name) {
                    this.modalTitle.textContent = oddsData.name;
                } else {
                    this.modalTitle.textContent = `比赛 ${matchId}`;
                }
            }
            
            // 获取赔率数据
            const oddsData = await oddsDataModule.fetchAllOddsData(matchId);
            
            // 填充表格数据
            this.populateOupeiTable(oddsData.oupei);
            this.populateYapanTable(oddsData.yapan);
            this.populateDaxiaoTable(oddsData.daxiao);
            
            // 渲染分析数据
            this.renderAnalysis(oddsData);
            
            // 显示赔率内容
            this.showOddsContent();
            
            // 获取并渲染平均数据、两队交战历史数据、近期战绩数据和主客场战绩数据
            if (window.matchDataModule) {
                const averageData = await matchDataModule.fetchAverageData(matchId);
                matchDataModule.renderAverageData(averageData);
                
                const headToHeadData = await matchDataModule.fetchHeadToHeadData(matchId);
                matchDataModule.renderHeadToHeadData(headToHeadData);
                
                const recentRecordsData = await matchDataModule.fetchRecentRecords(matchId);
                
                // 获取联赛平均数据
                let leagueAverageData = null;
                if (sid) {
                    leagueAverageData = await matchDataModule.fetchLeagueAverageData(sid);
                }
                
                // 传递leagueAverageData参数，用于计算xG
                matchDataModule.renderRecentRecords(recentRecordsData, leagueAverageData);
                
                const homeAwayRecordsData = await matchDataModule.fetchHomeAwayRecords(matchId);
                // 传递leagueAverageData参数，用于计算xG
                matchDataModule.renderHomeAwayRecords(homeAwayRecordsData, leagueAverageData);
                
                // 获取并渲染联赛积分榜数据和联赛平均数据
                if (sid) {
                    const standingsData = await matchDataModule.fetchStandingsData(sid);
                    // 将联赛平均数据合并到积分榜中渲染
                    matchDataModule.renderStandingsData(standingsData, leagueAverageData);
                }
                
                // 获取并渲染综合xG数据
                await matchDataModule.fetchAndRenderComprehensiveXg(matchId, leagueAverageData);
                
                // 预先获取比赛进程和球员名单数据，这样当用户切换到进程标签页时就不需要等待
                this.fetchAndRenderProcessData(matchId);
            }
            
            // 刷新智能分析数据
            if (typeof generateAIRecommendation === 'function') {
                // 检查当前是否在智能分析标签页
                const activeSubTab = this.modal.querySelector('.sub-tab-btn.active[data-sub-tab="smart-analysis"]');
                if (activeSubTab) {
                    generateAIRecommendation();
                }
            }
        } catch (error) {
            console.error('获取数据失败:', error);
            this.showError();
        }
    },
    

    
    /**
     * 关闭模态框
     */
    closeModal() {
        this.modal.style.display = 'none';
        this.currentMatchId = null;
        
        // 清除智能分析内容
        const aiRecommendation = this.modal.querySelector('#aiRecommendation');
        if (aiRecommendation) {
            aiRecommendation.innerHTML = '<p>正在生成AI智能分析...</p>';
        }
    }
};

// 暴露模块接口
if (typeof window !== 'undefined') {
    window.modalModule = modalModule;
}