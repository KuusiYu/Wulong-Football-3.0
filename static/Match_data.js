// Match_data.js - 处理比赛平均数据的前端逻辑

const matchDataModule = {
    /**
     * 获取平均数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 平均数据对象
     */
    async fetchAverageData(matchId) {
        try {
            const response = await fetch(`/api/odds/average/${matchId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取平均数据失败:', error);
            return null;
        }
    },
    
    /**
     * 获取两队交战历史数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 两队交战历史数据
     */
    async fetchHeadToHeadData(matchId) {
        try {
            const response = await fetch(`/api/odds/head-to-head/${matchId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取两队交战历史数据失败:', error);
            return null;
        }
    },
    
    /**
     * 获取两队近期战绩数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 两队近期战绩数据
     */
    async fetchRecentRecords(matchId) {
        try {
            const response = await fetch(`/api/odds/recent-records/${matchId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取两队近期战绩数据失败:', error);
            return null;
        }
    },

    /**
     * 获取两队区分主客场的近期战绩数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 两队区分主客场的近期战绩数据
     */
    async fetchHomeAwayRecords(matchId) {
        try {
            const response = await fetch(`/api/odds/home-away-records/${matchId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取两队区分主客场的近期战绩数据失败:', error);
            return null;
        }
    },
    
    /**
     * 获取联赛积分榜数据
     * @param {string} sid - 赛事ID
     * @returns {Promise<Object>} 联赛积分榜数据
     */
    async fetchStandingsData(sid) {
        try {
            const response = await fetch(`/api/standings/${sid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取联赛积分榜数据失败:', error);
            return null;
        }
    },
    
    /**
     * 获取联赛平均数据
     * @param {string} sid - 赛事ID
     * @returns {Promise<Object>} 联赛平均数据
     */
    async fetchLeagueAverageData(sid) {
        try {
            const response = await fetch(`/api/league-average/${sid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取联赛平均数据失败:', error);
            return null;
        }
    },

    /**
     * 渲染平均数据
     * @param {Object} averageData - 平均数据对象
     */
    renderAverageData(averageData) {
        if (!averageData || !averageData.home_team || !averageData.away_team) {
            this.renderNoData();
            return;
        }

        const container = document.getElementById('averageDataContainer');
        if (!container) return;

        const homeTeam = averageData.home_team;
        const awayTeam = averageData.away_team;

        container.innerHTML = `
            <div class="average-data-section">
                <h4>平均数据</h4>
                <div class="team-names">
                    <div class="team-name">${homeTeam.name}</div>
                    <div class="team-name">${awayTeam.name}</div>
                </div>
                <div class="average-tables">
                    <div class="team-table">
                        <table class="average-table">
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th>总平均数</th>
                                    <th>主场</th>
                                    <th>客场</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>平均入球</td>
                                    <td>${homeTeam.average.goals.total}</td>
                                    <td>${homeTeam.average.goals.home}</td>
                                    <td>${homeTeam.average.goals.away}</td>
                                </tr>
                                <tr>
                                    <td>平均失球</td>
                                    <td>${homeTeam.average.conceded.total}</td>
                                    <td>${homeTeam.average.conceded.home}</td>
                                    <td>${homeTeam.average.conceded.away}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="team-table">
                        <table class="average-table">
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th>总平均数</th>
                                    <th>主场</th>
                                    <th>客场</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>平均入球</td>
                                    <td>${awayTeam.average.goals.total}</td>
                                    <td>${awayTeam.average.goals.home}</td>
                                    <td>${awayTeam.average.goals.away}</td>
                                </tr>
                                <tr>
                                    <td>平均失球</td>
                                    <td>${awayTeam.average.conceded.total}</td>
                                    <td>${awayTeam.average.conceded.home}</td>
                                    <td>${awayTeam.average.conceded.away}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                ${this.renderPieChartData(homeTeam, awayTeam)}
            </div>
        `;
    },

    /**
     * 渲染饼图数据
     * @param {Object} homeTeam - 主队数据
     * @param {Object} awayTeam - 客队数据
     * @returns {string} HTML字符串
     */
    renderPieChartData(homeTeam, awayTeam) {
        // 检查是否有饼图数据
        if (!homeTeam.pie_data && !awayTeam.pie_data) {
            return '';
        }

        return `
            <div class="pie-chart-section">
                <div class="team-pie-chart">
                    ${homeTeam.pie_data ? this.renderTeamPieChart(homeTeam) : '<div class="no-pie-data">暂无数据</div>'}
                </div>
                <div class="team-pie-chart">
                    ${awayTeam.pie_data ? this.renderTeamPieChart(awayTeam) : '<div class="no-pie-data">暂无数据</div>'}
                </div>
            </div>
        `;
    },

    /**
     * 渲染单个球队的饼图数据
     * @param {Object} teamData - 球队数据
     * @returns {string} HTML字符串
     */
    renderTeamPieChart(teamData) {
        const pie = teamData.pie_data;
        if (!pie) return '';

        const winRate = ((pie.win / pie.total) * 100).toFixed(1);
        const drawRate = ((pie.draw / pie.total) * 100).toFixed(1);
        const loseRate = ((pie.lose / pie.total) * 100).toFixed(1);

        return `
            <div class="pie-chart-info">
                <h5>${teamData.name}</h5>
                <div class="pie-stats">
                    <div class="pie-stat-item">
                        <span class="stat-label">胜:</span>
                        <span class="stat-value win">${pie.win}场 (${winRate}%)</span>
                    </div>
                    <div class="pie-stat-item">
                        <span class="stat-label">平:</span>
                        <span class="stat-value draw">${pie.draw}场 (${drawRate}%)</span>
                    </div>
                    <div class="pie-stat-item">
                        <span class="stat-label">负:</span>
                        <span class="stat-value lose">${pie.lose}场 (${loseRate}%)</span>
                    </div>
                    <div class="pie-stat-item total">
                        <span class="stat-label">总场次:</span>
                        <span class="stat-value">${pie.total}场</span>
                    </div>
                    <div class="pie-stat-item goals">
                        <span class="stat-label">进球:</span>
                        <span class="stat-value">${pie.goals_for}</span>
                    </div>
                    <div class="pie-stat-item goals">
                        <span class="stat-label">失球:</span>
                        <span class="stat-value">${pie.goals_against}</span>
                    </div>
                </div>
                <div class="pie-chart-legend">
                    <div class="legend-item">
                        <span class="legend-color win"></span>
                        <span class="legend-text">胜</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color draw"></span>
                        <span class="legend-text">平</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color lose"></span>
                        <span class="legend-text">负</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 渲染无数据状态
     */
    renderNoData() {
        const container = document.getElementById('averageDataContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>暂无平均数据</p>
                </div>
            `;
        }
    },
    
    /**
     * 渲染两队交战历史数据
     * @param {Object} headToHeadData - 两队交战历史数据
     */
    renderHeadToHeadData(headToHeadData) {
        if (!headToHeadData || !headToHeadData.matches || headToHeadData.matches.length === 0) {
            this.renderNoHeadToHeadData();
            return;
        }

        const container = document.getElementById('headToHeadContainer');
        if (!container) return;

        const title = headToHeadData.title || '两队交战历史';
        const stats = headToHeadData.stats || '';
        const matches = headToHeadData.matches;

        container.innerHTML = `
            <div class="head-to-head-section">
                <h4>${title}</h4>
                ${this.renderHeadToHeadStats(stats, matches)}
                <div class="head-to-head-table-container">
                    <table class="head-to-head-table">
                        <thead>
                            <tr>
                                <th>赛事</th>
                                <th>比赛日期</th>
                                <th>对阵</th>
                                <th>半场</th>
                                <th>赛果</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matches.map(match => `
                                <tr>
                                    <td>${match.event}</td>
                                    <td>${match.date}</td>
                                    <td class="match-info">
                                        <span class="home-team">${match.match_info.home_team}</span>
                                        <span class="score">${match.match_info.score}</span>
                                        <span class="away-team">${match.match_info.away_team}</span>
                                    </td>
                                    <td>${match.half_score}</td>
                                    <td class="result ${match.result === '胜' ? 'win' : match.result === '平' ? 'draw' : 'lose'}">${match.result}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    /**
     * 渲染无两队交战历史数据状态
     */
    renderNoHeadToHeadData() {
        const container = document.getElementById('headToHeadContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>暂无两队交战历史数据</p>
                </div>
            `;
        }
    },
    
    /**
     * 解析球队战绩统计文本
     * @param {string} statsText - 战绩统计文本，如"近10场战绩7胜1平2负进17球失9球"
     * @returns {Object} 解析后的统计数据
     */
    parseTeamStats(statsText) {
        if (!statsText || typeof statsText !== 'string') {
            return null;
        }

        // 匹配战绩数据的正则表达式
        const regex = /近(\d+)场战绩(\d+)胜(\d+)平(\d+)负进(\d+)球失(\d+)球/;
        const match = statsText.match(regex);

        if (!match) {
            return null;
        }

        const totalMatches = parseInt(match[1]);
        const wins = parseInt(match[2]);
        const draws = parseInt(match[3]);
        const losses = parseInt(match[4]);
        const goalsFor = parseInt(match[5]);
        const goalsAgainst = parseInt(match[6]);

        // 计算胜率、平率、负率
        const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;
        const drawRate = totalMatches > 0 ? ((draws / totalMatches) * 100).toFixed(1) : 0;
        const lossRate = totalMatches > 0 ? ((losses / totalMatches) * 100).toFixed(1) : 0;

        // 计算场均进球、场均失球
        const avgGoalsFor = totalMatches > 0 ? (goalsFor / totalMatches).toFixed(2) : 0;
        const avgGoalsAgainst = totalMatches > 0 ? (goalsAgainst / totalMatches).toFixed(2) : 0;

        return {
            totalMatches,
            wins,
            draws,
            losses,
            goalsFor,
            goalsAgainst,
            winRate,
            drawRate,
            lossRate,
            avgGoalsFor,
            avgGoalsAgainst
        };
    },

    /**
     * 从比赛记录中提取半场数据并计算半场统计
     * @param {Array} matches - 比赛记录数组
     * @returns {Object} 半场统计数据
     */
    calculateHalfTimeStats(matches) {
        if (!matches || !Array.isArray(matches)) {
            return null;
        }

        let totalHalfGoalsFor = 0;
        let totalHalfGoalsAgainst = 0;
        let validMatches = 0;

        matches.forEach(match => {
            if (match && match.half_score && match.team_name && match.match_info && match.match_info.home_team && match.match_info.away_team) {
                const halfScore = match.half_score;
                const scoreParts = halfScore.split(':');
                if (scoreParts.length === 2) {
                    const homeHalfGoals = Number(scoreParts[0]);
                    const awayHalfGoals = Number(scoreParts[1]);

                    if (!isNaN(homeHalfGoals) && !isNaN(awayHalfGoals)) {
                        // 确定当前球队是主场还是客场
                        const isHomeTeam = match.match_info.home_team === match.team_name;
                        
                        if (isHomeTeam) {
                            totalHalfGoalsFor += homeHalfGoals;
                            totalHalfGoalsAgainst += awayHalfGoals;
                        } else {
                            totalHalfGoalsFor += awayHalfGoals;
                            totalHalfGoalsAgainst += homeHalfGoals;
                        }
                        validMatches++;
                    }
                }
            }
        });

        // 计算半场场均进球、场均失球
        const halfTimeAvgGoalsFor = validMatches > 0 ? (totalHalfGoalsFor / validMatches).toFixed(2) : 0;
        const halfTimeAvgGoalsAgainst = validMatches > 0 ? (totalHalfGoalsAgainst / validMatches).toFixed(2) : 0;

        return {
            validMatches,
            totalHalfGoalsFor,
            totalHalfGoalsAgainst,
            halfTimeAvgGoalsFor,
            halfTimeAvgGoalsAgainst
        };
    },

    /**
     * 解析交战历史统计文本
     * @param {string} statsText - 交战历史统计文本，如"双方近6次交战，拉齐奥青年队4胜0平2负，进12球，失7球，大球4次，小球2次"
     * @returns {Object} 解析后的统计数据
     */
    parseHeadToHeadStats(statsText) {
        if (!statsText || typeof statsText !== 'string') {
            return null;
        }

        // 匹配交战历史数据的正则表达式
        const regex = /双方近(\d+)次交战，([^，]+)(\d+)胜(\d+)平(\d+)负，进(\d+)球，失(\d+)球，大球(\d+)次，小球(\d+)次/;
        const match = statsText.match(regex);

        if (!match) {
            return null;
        }

        const totalMatches = parseInt(match[1]);
        const dominantTeam = match[2];
        const wins = parseInt(match[3]);
        const draws = parseInt(match[4]);
        const losses = parseInt(match[5]);
        const goalsFor = parseInt(match[6]);
        const goalsAgainst = parseInt(match[7]);
        const bigGoals = parseInt(match[8]);
        const smallGoals = parseInt(match[9]);

        // 计算胜率、平率、负率
        const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;
        const drawRate = totalMatches > 0 ? ((draws / totalMatches) * 100).toFixed(1) : 0;
        const lossRate = totalMatches > 0 ? ((losses / totalMatches) * 100).toFixed(1) : 0;

        // 计算场均进球、场均失球
        const avgGoalsFor = totalMatches > 0 ? (goalsFor / totalMatches).toFixed(2) : 0;
        const avgGoalsAgainst = totalMatches > 0 ? (goalsAgainst / totalMatches).toFixed(2) : 0;

        // 计算大球率、小球率
        const bigGoalRate = totalMatches > 0 ? ((bigGoals / totalMatches) * 100).toFixed(1) : 0;
        const smallGoalRate = totalMatches > 0 ? ((smallGoals / totalMatches) * 100).toFixed(1) : 0;

        return {
            totalMatches,
            dominantTeam,
            wins,
            draws,
            losses,
            goalsFor,
            goalsAgainst,
            bigGoals,
            smallGoals,
            winRate,
            drawRate,
            lossRate,
            avgGoalsFor,
            avgGoalsAgainst,
            bigGoalRate,
            smallGoalRate
        };
    },

    /**
     * 渲染球队统计数据
     * @param {string} statsText - 战绩统计文本
     * @param {Array} matches - 比赛记录数组（可选，用于计算半场数据）
     * @param {Object} xgData - xG数据（可选，用于显示xG）
     * @param {Object} halfTimeXgData - 半场xG数据（可选，用于显示半场xG）
     * @returns {string} HTML字符串
     */
    renderTeamStats(statsText, matches, xgData, halfTimeXgData) {
        const parsedStats = this.parseTeamStats(statsText);
        if (!parsedStats) {
            return statsText ? `<div class="team-stats">${statsText}</div>` : '';
        }

        // 计算半场统计数据
        let halfTimeStats = null;
        if (matches && Array.isArray(matches)) {
            halfTimeStats = this.calculateHalfTimeStats(matches);
        }

        return `
            <div class="team-stats-container">
                <div class="team-stats">${statsText}</div>
                <div class="calculated-stats">
                    <h6>详细统计</h6>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">胜率:</span>
                            <span class="stat-value win">${parsedStats.winRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">平率:</span>
                            <span class="stat-value draw">${parsedStats.drawRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">负率:</span>
                            <span class="stat-value lose">${parsedStats.lossRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">均进:</span>
                            <span class="stat-value goals">${parsedStats.avgGoalsFor}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">均失:</span>
                            <span class="stat-value goals">${parsedStats.avgGoalsAgainst}</span>
                        </div>
                        ${halfTimeStats ? `
                        <div class="stat-item">
                            <span class="stat-label">半场均进:</span>
                            <span class="stat-value goals">${halfTimeStats.halfTimeAvgGoalsFor}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">半场均失:</span>
                            <span class="stat-value goals">${halfTimeStats.halfTimeAvgGoalsAgainst}</span>
                        </div>
                        ` : ''}
                        ${xgData ? `
                        <div class="stat-item">
                            <span class="stat-label">xG:</span>
                            <span class="stat-value goals">${xgData}</span>
                        </div>
                        ` : ''}
                        ${halfTimeXgData ? `
                        <div class="stat-item">
                            <span class="stat-label">半场xG:</span>
                            <span class="stat-value goals">${halfTimeXgData}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 计算交战历史的半场统计数据
     * @param {Array} matches - 比赛记录数组
     * @param {string} dominantTeam - 优势球队名称
     * @returns {Object} 半场统计数据
     */
    calculateHeadToHeadHalfTimeStats(matches, dominantTeam) {
        if (!matches || !Array.isArray(matches) || !dominantTeam) {
            return null;
        }

        let totalHalfGoalsFor = 0;
        let totalHalfGoalsAgainst = 0;
        let validMatches = 0;

        matches.forEach(match => {
            if (match && match.half_score && match.match_info) {
                const halfScore = match.half_score;
                const scoreParts = halfScore.split(':');
                if (scoreParts.length === 2) {
                    const homeHalfGoals = Number(scoreParts[0]);
                    const awayHalfGoals = Number(scoreParts[1]);

                    if (!isNaN(homeHalfGoals) && !isNaN(awayHalfGoals)) {
                        // 确定优势球队是主场还是客场
                        const isHomeTeam = match.match_info.home_team === dominantTeam;
                        
                        if (isHomeTeam) {
                            totalHalfGoalsFor += homeHalfGoals;
                            totalHalfGoalsAgainst += awayHalfGoals;
                        } else {
                            totalHalfGoalsFor += awayHalfGoals;
                            totalHalfGoalsAgainst += homeHalfGoals;
                        }
                        validMatches++;
                    }
                }
            }
        });

        // 计算半场场均进球、场均失球
        const halfTimeAvgGoalsFor = validMatches > 0 ? (totalHalfGoalsFor / validMatches).toFixed(2) : 0;
        const halfTimeAvgGoalsAgainst = validMatches > 0 ? (totalHalfGoalsAgainst / validMatches).toFixed(2) : 0;

        return {
            validMatches,
            totalHalfGoalsFor,
            totalHalfGoalsAgainst,
            halfTimeAvgGoalsFor,
            halfTimeAvgGoalsAgainst
        };
    },

    /**
     * 渲染交战历史统计数据
     * @param {string} statsText - 交战历史统计文本
     * @param {Array} matches - 比赛记录数组（可选，用于计算半场数据）
     * @returns {string} HTML字符串
     */
    renderHeadToHeadStats(statsText, matches) {
        const parsedStats = this.parseHeadToHeadStats(statsText);
        if (!parsedStats) {
            return statsText ? `<div class="head-to-head-stats">${statsText}</div>` : '';
        }

        // 计算半场统计数据
        let halfTimeStats = null;
        if (matches && Array.isArray(matches) && parsedStats.dominantTeam) {
            halfTimeStats = this.calculateHeadToHeadHalfTimeStats(matches, parsedStats.dominantTeam);
        }

        // 计算交战历史的xG：均进 + 均失
        const headToHeadXg = (parseFloat(parsedStats.avgGoalsFor) + parseFloat(parsedStats.avgGoalsAgainst)).toFixed(2);

        return `
            <div class="head-to-head-stats-container">
                <div class="head-to-head-stats">${statsText}</div>
                <div class="calculated-stats">
                    <h6>详细统计</h6>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">${parsedStats.dominantTeam}胜率:</span>
                            <span class="stat-value win">${parsedStats.winRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">平率:</span>
                            <span class="stat-value draw">${parsedStats.drawRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">负率:</span>
                            <span class="stat-value lose">${parsedStats.lossRate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">均进:</span>
                            <span class="stat-value goals">${parsedStats.avgGoalsFor}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">均失:</span>
                            <span class="stat-value goals">${parsedStats.avgGoalsAgainst}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">xG:</span>
                            <span class="stat-value goals">${headToHeadXg}</span>
                        </div>
                        ${halfTimeStats ? `
                        <div class="stat-item">
                            <span class="stat-label">半场均进:</span>
                            <span class="stat-value goals">${halfTimeStats.halfTimeAvgGoalsFor}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">半场均失:</span>
                            <span class="stat-value goals">${halfTimeStats.halfTimeAvgGoalsAgainst}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">半场xG:</span>
                            <span class="stat-value goals">${(parseFloat(halfTimeStats.halfTimeAvgGoalsFor) + parseFloat(halfTimeStats.halfTimeAvgGoalsAgainst)).toFixed(2)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 渲染近期战绩数据
     * @param {Array} recentRecordsData - 近期战绩数据数组
     * @param {Object} leagueAverageData - 联赛平均数据（可选，用于计算xG）
     */
    renderRecentRecords(recentRecordsData, leagueAverageData) {
        if (!recentRecordsData || recentRecordsData.length === 0) {
            this.renderNoRecentRecordsData();
            return;
        }

        const container = document.getElementById('recentRecordsContainer');
        if (!container) return;

        // 先为所有比赛对象添加team_name属性，这样calculateHalfTimeStats才能正常工作
        recentRecordsData.forEach(teamData => {
            if (teamData && teamData.name && teamData.matches && Array.isArray(teamData.matches)) {
                teamData.matches.forEach(match => {
                    match.team_name = teamData.name;
                });
            }
        });

        // 计算近期战绩的主客队进攻强度与防守强度（xG）
        let xgStats = null;
        if (recentRecordsData.length === 2 && leagueAverageData) {
            const homeTeamData = recentRecordsData[0];
            const awayTeamData = recentRecordsData[1];
            
            const homeParsedStats = this.parseTeamStats(homeTeamData.stats);
            const awayParsedStats = this.parseTeamStats(awayTeamData.stats);
            
            if (homeParsedStats && awayParsedStats) {
                const homeGoals = parseFloat(leagueAverageData.homeGoals) || 1.0;
                const awayGoals = parseFloat(leagueAverageData.awayGoals) || 1.0;
                
                // 主队近期xG = (主队近期均进 * 客队近期均失) / 联赛主场场均进球
                const homeXg = (parseFloat(homeParsedStats.avgGoalsFor) * parseFloat(awayParsedStats.avgGoalsAgainst)) / homeGoals;
                // 客队近期xG = (客队近期均进 * 主队近期均失) / 联赛客场场均进球
                const awayXg = (parseFloat(awayParsedStats.avgGoalsFor) * parseFloat(homeParsedStats.avgGoalsAgainst)) / awayGoals;
                
                // 计算半场xG，将联赛平均数据除以2
                const homeHalfGoals = (parseFloat(leagueAverageData.homeGoals) || 1.0) / 2;
                const awayHalfGoals = (parseFloat(leagueAverageData.awayGoals) || 1.0) / 2;
                
                // 获取主队和客队的半场数据
                const homeHalfStats = this.calculateHalfTimeStats(homeTeamData.matches);
                const awayHalfStats = this.calculateHalfTimeStats(awayTeamData.matches);
                
                let homeHalfXg = null;
                let awayHalfXg = null;
                
                if (homeHalfStats && awayHalfStats) {
                    // 主队近期半场xG = (主队近期半场均进 * 客队近期半场均失) / (联赛主场场均进球 / 2)
                    homeHalfXg = (parseFloat(homeHalfStats.halfTimeAvgGoalsFor) * parseFloat(awayHalfStats.halfTimeAvgGoalsAgainst)) / homeHalfGoals;
                    // 客队近期半场xG = (客队近期半场均进 * 主队近期半场均失) / (联赛客场场均进球 / 2)
                    awayHalfXg = (parseFloat(awayHalfStats.halfTimeAvgGoalsFor) * parseFloat(homeHalfStats.halfTimeAvgGoalsAgainst)) / awayHalfGoals;
                }
                
                xgStats = {
                    homeXg: homeXg.toFixed(2),
                    awayXg: awayXg.toFixed(2),
                    homeHalfXg: homeHalfXg ? homeHalfXg.toFixed(2) : null,
                    awayHalfXg: awayHalfXg ? awayHalfXg.toFixed(2) : null,
                    homeTeamName: homeTeamData.name,
                    awayTeamName: awayTeamData.name
                };
            }
        }

        container.innerHTML = `
            <div class="recent-records-section">
                <h4>近期战绩</h4>
                <div class="recent-records-teams">
                    ${recentRecordsData.map(teamData => {
                        if (!teamData || !teamData.name) return '';
                        
                        // 为当前球队获取对应的xG数据
                        let teamXg = null;
                        let teamHalfXg = null;
                        if (xgStats) {
                            if (teamData.name === xgStats.homeTeamName) {
                                teamXg = xgStats.homeXg;
                                teamHalfXg = xgStats.homeHalfXg;
                            } else if (teamData.name === xgStats.awayTeamName) {
                                teamXg = xgStats.awayXg;
                                teamHalfXg = xgStats.awayHalfXg;
                            }
                        }
                        
                        return `
                            <div class="team-records">
                                <h5>${teamData.name}</h5>
                                ${this.renderTeamStats(teamData.stats, teamData.matches, teamXg, teamHalfXg)}
                                <div class="team-records-table-container">
                                    <table class="recent-records-table">
                                        <thead>
                                            <tr>
                                                <th>赛事</th>
                                                <th>日期</th>
                                                <th>对阵</th>
                                                <th>半场</th>
                                                <th>赛果</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${teamData.matches && teamData.matches.length > 0 ? teamData.matches.map(match => {
                                                return `
                                                    <tr>
                                                        <td>${match.event}</td>
                                                        <td>${match.date}</td>
                                                        <td class="match-info">
                                                            <span class="home-team">${match.match_info.home_team}</span>
                                                            <span class="score">${match.match_info.score}</span>
                                                            <span class="away-team">${match.match_info.away_team}</span>
                                                        </td>
                                                        <td>${match.half_score}</td>
                                                        <td class="result ${match.result === '胜' ? 'win' : match.result === '平' ? 'draw' : 'lose'}">${match.result}</td>
                                                    </tr>
                                                `;
                                            }).join('') : `<tr><td colspan="5" class="no-data">暂无比赛记录</td></tr>`}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    /**
     * 渲染无近期战绩数据状态
     */
    renderNoRecentRecordsData() {
        const container = document.getElementById('recentRecordsContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>暂无近期战绩数据</p>
                </div>
            `;
        }
    },

    /**
     * 渲染两队区分主客场的近期战绩数据
     * @param {Array} homeAwayRecordsData - 主客场战绩数据数组
     * @param {Object} leagueAverageData - 联赛平均数据（可选，用于计算xG）
     */
    renderHomeAwayRecords(homeAwayRecordsData, leagueAverageData) {
        if (!homeAwayRecordsData || homeAwayRecordsData.length === 0) {
            this.renderNoHomeAwayRecordsData();
            return;
        }

        const container = document.getElementById('homeAwayRecordsContainer');
        if (!container) return;

        // 先为所有比赛对象添加team_name属性，这样calculateHalfTimeStats才能正常工作
        homeAwayRecordsData.forEach(teamData => {
            if (teamData && teamData.name && teamData.matches && Array.isArray(teamData.matches)) {
                teamData.matches.forEach(match => {
                    match.team_name = teamData.name;
                });
            }
        });

        // 计算主客场战绩的主客队进攻强度与防守强度（xG）
        let xgStats = null;
        if (homeAwayRecordsData.length === 2 && leagueAverageData) {
            const homeTeamData = homeAwayRecordsData[0];
            const awayTeamData = homeAwayRecordsData[1];
            
            const homeParsedStats = this.parseTeamStats(homeTeamData.stats);
            const awayParsedStats = this.parseTeamStats(awayTeamData.stats);
            
            if (homeParsedStats && awayParsedStats) {
                const homeGoals = parseFloat(leagueAverageData.homeGoals) || 1.0;
                const awayGoals = parseFloat(leagueAverageData.awayGoals) || 1.0;
                
                // 主队近期xG = (主队近期均进 * 客队近期均失) / 联赛主场场均进球
                const homeXg = (parseFloat(homeParsedStats.avgGoalsFor) * parseFloat(awayParsedStats.avgGoalsAgainst)) / homeGoals;
                // 客队近期xG = (客队近期均进 * 主队近期均失) / 联赛客场场均进球
                const awayXg = (parseFloat(awayParsedStats.avgGoalsFor) * parseFloat(homeParsedStats.avgGoalsAgainst)) / awayGoals;
                
                // 计算半场xG，将联赛平均数据除以2
                const homeHalfGoals = (parseFloat(leagueAverageData.homeGoals) || 1.0) / 2;
                const awayHalfGoals = (parseFloat(leagueAverageData.awayGoals) || 1.0) / 2;
                
                // 获取主队和客队的半场数据
                const homeHalfStats = this.calculateHalfTimeStats(homeTeamData.matches);
                const awayHalfStats = this.calculateHalfTimeStats(awayTeamData.matches);
                
                let homeHalfXg = null;
                let awayHalfXg = null;
                
                if (homeHalfStats && awayHalfStats) {
                    // 主队近期半场xG = (主队近期半场均进 * 客队近期半场均失) / (联赛主场场均进球 / 2)
                    homeHalfXg = (parseFloat(homeHalfStats.halfTimeAvgGoalsFor) * parseFloat(awayHalfStats.halfTimeAvgGoalsAgainst)) / homeHalfGoals;
                    // 客队近期半场xG = (客队近期半场均进 * 主队近期半场均失) / (联赛客场场均进球 / 2)
                    awayHalfXg = (parseFloat(awayHalfStats.halfTimeAvgGoalsFor) * parseFloat(homeHalfStats.halfTimeAvgGoalsAgainst)) / awayHalfGoals;
                }
                
                xgStats = {
                    homeXg: homeXg.toFixed(2),
                    awayXg: awayXg.toFixed(2),
                    homeHalfXg: homeHalfXg ? homeHalfXg.toFixed(2) : null,
                    awayHalfXg: awayHalfXg ? awayHalfXg.toFixed(2) : null,
                    homeTeamName: homeTeamData.name,
                    awayTeamName: awayTeamData.name
                };
            }
        }

        container.innerHTML = `
            <div class="recent-records-section">
                <h4>主客场战绩</h4>
                <div class="recent-records-teams">
                    ${homeAwayRecordsData.map(teamData => {
                        if (!teamData || !teamData.name) return '';
                        
                        // team_name属性已经在前面添加过了
                        
                        // 为当前球队获取对应的xG数据
                        let teamXg = null;
                        let teamHalfXg = null;
                        if (xgStats) {
                            if (teamData.name === xgStats.homeTeamName) {
                                teamXg = xgStats.homeXg;
                                teamHalfXg = xgStats.homeHalfXg;
                            } else if (teamData.name === xgStats.awayTeamName) {
                                teamXg = xgStats.awayXg;
                                teamHalfXg = xgStats.awayHalfXg;
                            }
                        }
                        
                        return `
                            <div class="team-records">
                                <h5>${teamData.name} (${teamData.current_type === 'home' ? '主场' : '客场'})</h5>
                                ${this.renderTeamStats(teamData.stats, teamData.matches, teamXg, teamHalfXg)}
                                <div class="team-records-table-container">
                                    <table class="recent-records-table">
                                        <thead>
                                            <tr>
                                                <th>赛事</th>
                                                <th>日期</th>
                                                <th>对阵</th>
                                                <th>半场</th>
                                                <th>赛果</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${teamData.matches && teamData.matches.length > 0 ? teamData.matches.map(match => `
                                                <tr>
                                                    <td>${match.event}</td>
                                                    <td>${match.date}</td>
                                                    <td class="match-info">
                                                        <span class="home-team">${match.match_info.home_team}</span>
                                                        <span class="score">${match.match_info.score}</span>
                                                        <span class="away-team">${match.match_info.away_team}</span>
                                                    </td>
                                                    <td>${match.half_score}</td>
                                                    <td class="result ${match.result === '胜' ? 'win' : match.result === '平' ? 'draw' : 'lose'}">${match.result}</td>
                                                </tr>
                                            `).join('') : `<tr><td colspan="5" class="no-data">暂无比赛记录</td></tr>`}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    /**
     * 渲染无主客场战绩数据状态
     */
    renderNoHomeAwayRecordsData() {
        const container = document.getElementById('homeAwayRecordsContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>暂无主客场战绩数据</p>
                </div>
            `;
        }
    },
    
    /**
     * 渲染联赛积分榜数据
     * @param {Object} standingsData - 积分榜数据
     * @param {Object} leagueAverageData - 联赛平均数据
     */
    renderStandingsData(standingsData, leagueAverageData) {
        if (!standingsData || !standingsData.teams || standingsData.teams.length === 0) {
            this.renderNoStandingsData();
            return;
        }

        const container = document.getElementById('standingsContainer');
        if (!container) return;

        const title = standingsData.title || '联赛积分榜';
        const teams = standingsData.teams;
        
        // 计算联赛平均数据
        let leagueAverageHtml = '';
        if (leagueAverageData) {
            const homeGoals = leagueAverageData.homeGoals || 0;
            const awayGoals = leagueAverageData.awayGoals || 0;
            const totalGoals = (parseFloat(homeGoals) + parseFloat(awayGoals)).toFixed(2);
            
            leagueAverageHtml = `
                <div class="league-average-info">
                    <p class="lb">场均总进球:${totalGoals}个</p>
                    <p>主场场均进球:${homeGoals}个&nbsp;&nbsp;&nbsp;&nbsp;客场场均进球:${awayGoals}个</p>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="standings-section">
                <div class="lbox_hd">
                    <h3 class="lbox_tit">${title}</h3>
                    ${standingsData.moreUrl ? `<div class="lcol_tit_r"><a target="_blank" href="${standingsData.moreUrl}">查看详细</a></div>` : ''}
                    ${leagueAverageHtml}
                </div>
                <div class="lbox_bd">
                    <table border="0" cellspacing="0" cellpadding="0" class="lstable1 ljifen_top_list_s jTrHover">
                        <thead>
                            <tr>
                                <th width="28" class="first">排名</th>
                                <th>队伍</th>
                                <th width="28">赛</th>
                                <th width="28">胜</th>
                                <th width="28">平</th>
                                <th width="28">负</th>
                                <th width="28" class="last">积分</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${teams.map(team => `
                                <tr>
                                    <td class="first">${team.rank}</td>
                                    <td>${team.teamUrl ? `<a href="${team.teamUrl}" target="_blank" title="${team.name}">${team.name}</a>` : team.name}</td>
                                    <td>${team.matches}</td>
                                    <td>${team.wins}</td>
                                    <td>${team.draws}</td>
                                    <td>${team.losses}</td>
                                    <td class="td_jif last">${team.points}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },
    
    /**
     * 渲染无积分榜数据状态
     */
    renderNoStandingsData() {
        const container = document.getElementById('standingsContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-data">
                    <p>暂无积分榜数据</p>
                </div>
            `;
        }
    },
    

    
    /**
     * 获取并渲染所有比赛数据
     * @param {string} matchId - 比赛ID
     * @param {string} sid - 赛事ID（可选，如不提供则自动从页面获取）
     */
    async fetchAndRenderAllData(matchId, sid) {
        // 如果没有提供sid，则尝试从页面获取
        if (!sid) {
            sid = this.getSidFromPage();
        }
        
        // 获取联赛平均数据（用于计算xG）
        let leagueAverageData = null;
        if (sid) {
            leagueAverageData = await this.fetchLeagueAverageData(sid);
        }
        
        // 获取并渲染平均数据
        const averageData = await this.fetchAverageData(matchId);
        this.renderAverageData(averageData);
        
        // 获取并渲染两队交战历史数据
        const headToHeadData = await this.fetchHeadToHeadData(matchId);
        this.renderHeadToHeadData(headToHeadData);
        
        // 获取并渲染近期战绩数据
        const recentRecordsData = await this.fetchRecentRecords(matchId);
        this.renderRecentRecords(recentRecordsData, leagueAverageData);
        
        // 获取并渲染主客场战绩数据
        const homeAwayRecordsData = await this.fetchHomeAwayRecords(matchId);
        this.renderHomeAwayRecords(homeAwayRecordsData, leagueAverageData);
        
        // 获取并渲染联赛积分榜数据
        if (sid) {
            const standingsData = await this.fetchStandingsData(sid);
            // 将联赛平均数据合并到积分榜中渲染
            this.renderStandingsData(standingsData, leagueAverageData);
        }
        
        // 获取并渲染综合xG数据
        await this.fetchAndRenderComprehensiveXg(matchId, leagueAverageData);
    },
    
    /**
     * 从页面获取赛事ID（sid）
     * @returns {string|null} 赛事ID
     */
    getSidFromPage() {
        // 尝试从比赛表格中的td元素获取sid
        const sidElement = document.querySelector('.status');
        if (sidElement) {
            return sidElement.textContent.trim();
        }
        
        // 如果找不到，尝试从URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('sid');
    },

    /**
     * 获取比赛进程数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 比赛进程数据
     */
    async fetchMatchProcessData(matchId) {
        try {
            const url = `/api/match-process/${matchId}`;
            console.log(`请求比赛进程数据: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('比赛进程数据:', data);
            return data;
        } catch (error) {
            console.error('获取比赛进程数据失败:', error);
            return null;
        }
    },
    
    /**
     * 获取球员名单数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 球员名单数据
     */
    async fetchPlayersData(matchId) {
        try {
            const url = `/api/players/${matchId}`;
            console.log(`请求球员名单数据: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('球员名单数据:', data);
            return data;
        } catch (error) {
            console.error('获取球员名单数据失败:', error);
            return null;
        }
    },
    
    /**
     * 渲染比赛进程数据
     * @param {Object} matchProcessData - 比赛进程数据
     */
    /**
     * 将图片路径转换为Font Awesome图标类名
     * @param {string} iconPath - 图片路径
     * @returns {string} Font Awesome图标HTML
     */
    getFontAwesomeIcon(iconPath) {
        if (!iconPath) return '&nbsp;';
        
        // 映射图片路径到Font Awesome图标
        const iconMap = {
            '/images/row/1.gif': '<i class="fas fa-futbol" style="color: #27ae60;"></i>', // 入球
            '/images/row/3.gif': '<i class="fas fa-futbol" style="color: #e74c3c;"></i>', // 点球
            '/images/row/2.gif': '<i class="fas fa-rotate-right" style="color: #f39c12;"></i>', // 乌龙
            '/images/row/4.gif': '<i class="fas fa-triangle-exclamation" style="color: #f39c12;"></i>', // 黄牌
            '/images/row/5.gif': '<i class="fas fa-circle-exclamation" style="color: #e74c3c;"></i>', // 红牌
            '/images/row/6.gif': '<i class="fas fa-triangle-exclamation" style="color: #e74c3c;"></i><i class="fas fa-circle-exclamation" style="color: #e74c3c;"></i>', // 两黄变红
            '/images/row/7.gif': '<i class="fas fa-xmark-circle" style="color: #e74c3c;"></i>', // 入球无效
            '/images/row/8.gif': '<i class="fas fa-arrow-right-arrow-left" style="color: #3498db;"></i>', // 换人
            '/images/row/9.gif': '<i class="fas fa-arrow-right-to-bracket" style="color: #27ae60;"></i>', // 换入
            '/images/row/10.gif': '<i class="fas fa-arrow-right-from-bracket" style="color: #e74c3c;"></i>' // 换出
        };
        
        return iconMap[iconPath] || '&nbsp;';
    },
    
    /**
     * 渲染比赛进程数据
     * @param {Object} matchProcessData - 比赛进程数据
     */
    renderMatchProcessData(matchProcessData) {
        const loading = document.getElementById('matchProcessLoading');
        const content = document.getElementById('matchProcessContent');
        const tbody = document.getElementById('matchEventsTableBody');
        
        if (!loading || !content || !tbody) return;
        
        loading.style.display = 'none';
        
        if (!matchProcessData || matchProcessData.length === 0) {
            content.innerHTML = '<div class="no-data"><p>暂无比赛进程数据</p></div>';
            content.style.display = 'block';
            return;
        }
        
        tbody.innerHTML = matchProcessData.map(event => `
            <tr ${event.home_event || event.away_event ? '' : 'class="tr2"'}>
                <td>${this.getFontAwesomeIcon(event.home_icon)}</td>
                <td>${event.home_event || '&nbsp;'}</td>
                <td class="time">${event.time}</td>
                <td>${event.away_event || '&nbsp;'}</td>
                <td>${this.getFontAwesomeIcon(event.away_icon)}</td>
            </tr>
        `).join('');
        
        content.style.display = 'block';
    },
    
    /**
     * 渲染球员名单数据
     * @param {Object} playersData - 球员名单数据
     */
    renderPlayersData(playersData) {
        const loading = document.getElementById('playersLoading');
        const content = document.getElementById('playersContent');
        const homeStarting = document.getElementById('homeStartingLineup');
        const homeSubstitutes = document.getElementById('homeSubstitutes');
        const awayStarting = document.getElementById('awayStartingLineup');
        const awaySubstitutes = document.getElementById('awaySubstitutes');
        
        if (!loading || !content || !homeStarting || !homeSubstitutes || !awayStarting || !awaySubstitutes) return;
        
        loading.style.display = 'none';
        
        if (!playersData || (!playersData.home_team && !playersData.away_team)) {
            content.innerHTML = '<div class="no-data"><p>暂无球员名单数据</p></div>';
            content.style.display = 'block';
            return;
        }
        
        // 渲染主队首发阵容
        homeStarting.innerHTML = this.renderPlayerTable(playersData.home_team.starting_lineup);
        
        // 渲染主队替补
        homeSubstitutes.innerHTML = this.renderPlayerTable(playersData.home_team.substitutes);
        
        // 渲染客队首发阵容
        awayStarting.innerHTML = this.renderPlayerTable(playersData.away_team.starting_lineup);
        
        // 渲染客队替补
        awaySubstitutes.innerHTML = this.renderPlayerTable(playersData.away_team.substitutes);
        
        content.style.display = 'block';
    },
    
    /**
     * 获取技术统计数据
     * @param {string} matchId - 比赛ID
     * @returns {Promise<Object>} 技术统计数据
     */
    async fetchTechStatsData(matchId) {
        try {
            const url = `/api/tech-stats/${matchId}`;
            console.log(`请求技术统计数据: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('技术统计数据:', data);
            return data;
        } catch (error) {
            console.error('获取技术统计数据失败:', error);
            return null;
        }
    },
    
    /**
     * 渲染技术统计数据
     * @param {Object} statsData - 技术统计数据
     * @param {string} homeTeam - 主队名称
     * @param {string} awayTeam - 客队名称
     */
    renderTechStatsData(statsData, homeTeam, awayTeam) {
        const loading = document.getElementById('statsLoading');
        const content = document.getElementById('statsContent');
        const homeTeamTitle = document.getElementById('homeTeamTitle');
        const awayTeamTitle = document.getElementById('awayTeamTitle');
        const techStatsTable = document.getElementById('techStatsTable');
        
        if (!loading || !content || !homeTeamTitle || !awayTeamTitle || !techStatsTable) return;
        
        loading.style.display = 'none';
        
        // 设置球队名称
        homeTeamTitle.textContent = homeTeam || '主队';
        awayTeamTitle.textContent = awayTeam || '客队';
        
        if (!statsData || !statsData.stats || statsData.stats.length === 0) {
            content.innerHTML = '<div class="no-data"><p>暂无技术统计数据</p></div>';
            content.style.display = 'block';
            return;
        }
        
        // 渲染技术统计表格
        techStatsTable.innerHTML = statsData.stats.map(stat => `
            <tr>
                <td width="235" align="right"><div class="bar_bg"><span style="width:${stat.homeBarWidth}px;"></span></div></td>
                <td width="40" align="center">${stat.homeValue}</td>
                <td height="33" align="center" bgcolor="#e4e4e4">${stat.label}</td>
                <td width="40" align="center">${stat.awayValue}</td>
                <td width="235" align="left"><div class="bar_bg"><span style="width:${stat.awayBarWidth}px;"></span></div></td>
            </tr>
        `).join('');
        
        content.style.display = 'block';
    },
    
    /**
     * 渲染单个球员表格
     * @param {Array} players - 球员数组
     * @returns {string} HTML字符串
     */
    renderPlayerTable(players) {
        if (!players || players.length === 0) {
            return '<div class="no-data"><p>暂无数据</p></div>';
        }
        
        return `
            <table border="0" cellspacing="0" cellpadding="3">
                ${players.map(player => `
                    <tr>
                        <td align="right"></td>
                        <td>${player.number} ${player.name}(${player.position})</td>
                    </tr>
                `).join('')}
            </table>
        `;
    },
    
    /**
     * 初始化平均数据功能
     */
    init() {
        console.log('Match_data.js initialized');
        
        // 尝试自动初始化，如果页面中有需要的数据
        const matchId = this.getMatchIdFromPage();
        if (matchId) {
            this.fetchAndRenderAllData(matchId);
        }
    },
    
    /**
     * 从页面获取比赛ID
     * @returns {string|null} 比赛ID
     */
    getMatchIdFromPage() {
        // 尝试从URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('matchId') || urlParams.get('id');
    },

    /**
     * 计算综合xG数据
     * @param {Object} homeAwayXg - 主客场战绩xG数据
     * @param {Object} recentXg - 近期战绩xG数据
     * @param {Object} headToHeadXg - 历史交战记录xG数据
     * @returns {Object} 综合xG数据
     */
    calculateComprehensiveXg(homeAwayXg, recentXg, headToHeadXg) {
        // 检查是否有历史交战记录
        const hasHeadToHead = parseFloat(headToHeadXg) > 0;
        
        // 根据是否有历史交战记录设置不同的权重
        let homeAwayWeight, recentWeight, headToHeadWeight;
        if (hasHeadToHead) {
            // 有历史交战记录时的权重配比
            homeAwayWeight = 0.5;
            recentWeight = 0.3;
            headToHeadWeight = 0.2;
        } else {
            // 没有历史交战记录时的权重配比：0.65主客场xG + 0.35近期战绩xG
            homeAwayWeight = 0.65;
            recentWeight = 0.35;
            headToHeadWeight = 0;
        }
        
        // 计算主队全场xG
        const homeFullTimeXg = (parseFloat(homeAwayXg.homeXg) * homeAwayWeight) + 
                               (parseFloat(recentXg.homeXg) * recentWeight) + 
                               (parseFloat(headToHeadXg) * headToHeadWeight);
        
        // 计算客队全场xG
        const awayFullTimeXg = (parseFloat(homeAwayXg.awayXg) * homeAwayWeight) + 
                               (parseFloat(recentXg.awayXg) * recentWeight) + 
                               (parseFloat(headToHeadXg) * headToHeadWeight);
        
        // 计算主队半场xG：取全场xG的一半
        const homeHalfTimeXg = (homeFullTimeXg / 2).toFixed(2);
        
        // 计算客队半场xG：取全场xG的一半
        const awayHalfTimeXg = (awayFullTimeXg / 2).toFixed(2);
        
        return {
            home: {
                fullTime: homeFullTimeXg.toFixed(2),
                halfTime: homeHalfTimeXg,
                breakdown: {
                    homeAwayContribution: (parseFloat(homeAwayXg.homeXg) * homeAwayWeight).toFixed(2),
                    recentContribution: (parseFloat(recentXg.homeXg) * recentWeight).toFixed(2),
                    headToHeadContribution: (parseFloat(headToHeadXg) * headToHeadWeight).toFixed(2)
                }
            },
            away: {
                fullTime: awayFullTimeXg.toFixed(2),
                halfTime: awayHalfTimeXg,
                breakdown: {
                    homeAwayContribution: (parseFloat(homeAwayXg.awayXg) * homeAwayWeight).toFixed(2),
                    recentContribution: (parseFloat(recentXg.awayXg) * recentWeight).toFixed(2),
                    headToHeadContribution: (parseFloat(headToHeadXg) * headToHeadWeight).toFixed(2)
                }
            }
        };
    },

    /**
     * 获取并渲染综合xG数据
     * @param {string} matchId - 比赛ID
     * @param {Object} leagueAverageData - 联赛平均数据
     * @param {Object} teamNames - 主客队名称对象
     */
    async fetchAndRenderComprehensiveXg(matchId, leagueAverageData, teamNames = null) {
        const container = document.getElementById('comprehensiveData');
        if (!container) return;
        
        // 显示加载状态
        container.innerHTML = `
            <div class="loading-state">
                <p>正在加载xG数据...</p>
            </div>
        `;
        
        try {
            // 如果没有提供teamNames，尝试从页面获取
            let homeTeamName = '主队';
            let awayTeamName = '客队';
            
            if (teamNames) {
                homeTeamName = teamNames.home;
                awayTeamName = teamNames.away;
            } else {
                // 尝试从modal标题获取主客队名称
                const modalTitle = document.getElementById('modalTitle');
                if (modalTitle && modalTitle.textContent) {
                    const titleText = modalTitle.textContent.trim();
                    const teamParts = titleText.split(' - ');
                    if (teamParts.length === 2) {
                        homeTeamName = teamParts[0].trim();
                        awayTeamName = teamParts[1].trim();
                    }
                }
            }
            
            // 获取必要的数据
            const recentRecordsData = await this.fetchRecentRecords(matchId);
            const homeAwayRecordsData = await this.fetchHomeAwayRecords(matchId);
            const headToHeadData = await this.fetchHeadToHeadData(matchId);
            
            // 计算各部分xG数据
            let recentXg = { homeXg: 0, awayXg: 0 };
            let homeAwayXg = { homeXg: 0, awayXg: 0 };
            let headToHeadXg = 0;
            
            // 计算近期战绩xG
            if (recentRecordsData && recentRecordsData.length === 2 && leagueAverageData) {
                const homeTeamData = recentRecordsData[0];
                const awayTeamData = recentRecordsData[1];
                
                const homeParsedStats = this.parseTeamStats(homeTeamData.stats);
                const awayParsedStats = this.parseTeamStats(awayTeamData.stats);
                
                if (homeParsedStats && awayParsedStats) {
                    const homeGoals = parseFloat(leagueAverageData.homeGoals) || 1.0;
                    const awayGoals = parseFloat(leagueAverageData.awayGoals) || 1.0;
                    
                    // 主队近期xG = (主队近期均进 * 客队近期均失) / 联赛主场场均进球
                    const homeRecentXg = (parseFloat(homeParsedStats.avgGoalsFor) * parseFloat(awayParsedStats.avgGoalsAgainst)) / homeGoals;
                    // 客队近期xG = (客队近期均进 * 主队近期均失) / 联赛客场场均进球
                    const awayRecentXg = (parseFloat(awayParsedStats.avgGoalsFor) * parseFloat(homeParsedStats.avgGoalsAgainst)) / awayGoals;
                    
                    recentXg = {
                        homeXg: homeRecentXg.toFixed(2),
                        awayXg: awayRecentXg.toFixed(2)
                    };
                }
            }
            
            // 计算主客场战绩xG
            if (homeAwayRecordsData && homeAwayRecordsData.length === 2 && leagueAverageData) {
                const homeTeamData = homeAwayRecordsData[0];
                const awayTeamData = homeAwayRecordsData[1];
                
                const homeParsedStats = this.parseTeamStats(homeTeamData.stats);
                const awayParsedStats = this.parseTeamStats(awayTeamData.stats);
                
                if (homeParsedStats && awayParsedStats) {
                    const homeGoals = parseFloat(leagueAverageData.homeGoals) || 1.0;
                    const awayGoals = parseFloat(leagueAverageData.awayGoals) || 1.0;
                    
                    // 主队主客场xG = (主队近期均进 * 客队近期均失) / 联赛主场场均进球
                    const homeHomeAwayXg = (parseFloat(homeParsedStats.avgGoalsFor) * parseFloat(awayParsedStats.avgGoalsAgainst)) / homeGoals;
                    // 客队主客场xG = (客队近期均进 * 主队近期均失) / 联赛客场场均进球
                    const awayHomeAwayXg = (parseFloat(awayParsedStats.avgGoalsFor) * parseFloat(homeParsedStats.avgGoalsAgainst)) / awayGoals;
                    
                    homeAwayXg = {
                        homeXg: homeHomeAwayXg.toFixed(2),
                        awayXg: awayHomeAwayXg.toFixed(2)
                    };
                }
            }
            
            // 计算历史交战记录xG
            if (headToHeadData && headToHeadData.stats) {
                const parsedStats = this.parseHeadToHeadStats(headToHeadData.stats);
                if (parsedStats) {
                    // 交战历史的xG：均进 + 均失
                    headToHeadXg = (parseFloat(parsedStats.avgGoalsFor) + parseFloat(parsedStats.avgGoalsAgainst)).toFixed(2);
                }
            }
            
            // 计算综合xG
            const comprehensiveXg = this.calculateComprehensiveXg(homeAwayXg, recentXg, headToHeadXg);
            
            // 渲染综合xG数据
            this.renderComprehensiveXg(comprehensiveXg, { home: homeTeamName, away: awayTeamName });
        } catch (error) {
            console.error('获取或计算xG数据失败:', error);
            
            // 显示错误状态
            container.innerHTML = `
                <div class="error-state">
                    <p>无法加载xG数据，请稍后重试</p>
                </div>
            `;
        }
    },

    /**
     * 渲染综合xG数据
     * @param {Object} xgData - 综合xG数据
     * @param {Object} teamNames - 主客队名称对象
     */
    renderComprehensiveXg(xgData, teamNames) {
        const container = document.getElementById('comprehensiveData');
        if (!container) return;
        
        // 获取主客队名称，如果没有提供则使用默认值
        const homeTeamName = teamNames ? teamNames.home : '主队';
        const awayTeamName = teamNames ? teamNames.away : '客队';
        
        // 计算全场概率分布
        const homeFullXg = parseFloat(xgData.home.fullTime);
        const awayFullXg = parseFloat(xgData.away.fullTime);
        
        const fullWinDrawLoss = this.calculateWinDrawLossProbabilities(homeFullXg, awayFullXg);
        const fullScoreCombinations = this.calculateScoreCombinationProbabilities(homeFullXg, awayFullXg);
        const fullGoalDistributions = this.calculateGoalDistributions(homeFullXg, awayFullXg);
        
        // 计算半场概率分布
        const homeHalfXg = parseFloat(xgData.home.halfTime);
        const awayHalfXg = parseFloat(xgData.away.halfTime);
        
        const halfWinDrawLoss = this.calculateWinDrawLossProbabilities(homeHalfXg, awayHalfXg);
        const halfScoreCombinations = this.calculateScoreCombinationProbabilities(homeHalfXg, awayHalfXg);
        const halfGoalDistributions = this.calculateGoalDistributions(homeHalfXg, awayHalfXg);
        
        // 计算半全场概率分布
        const halfFullProbabilities = this.calculateHalfFullProbabilities(homeHalfXg, awayHalfXg, homeFullXg, awayFullXg);
        
        container.innerHTML = `
            <div class="xg-comparison">
                <div class="team-xg-card">
                    <div class="team-xg-header">
                        <h5>${homeTeamName}</h5>
                    </div>
                    <div class="xg-values">
                        <div class="xg-value-item">
                            <div class="xg-label">全场xG</div>
                            <div class="xg-value full-time">${xgData.home.fullTime}</div>
                        </div>
                        <div class="xg-value-item">
                            <div class="xg-label">半场xG</div>
                            <div class="xg-value half-time">${xgData.home.halfTime}</div>
                        </div>
                    </div>
                </div>
                <div class="team-xg-card">
                    <div class="team-xg-header">
                        <h5>${awayTeamName}</h5>
                    </div>
                    <div class="xg-values">
                        <div class="xg-value-item">
                            <div class="xg-label">全场xG</div>
                            <div class="xg-value full-time">${xgData.away.fullTime}</div>
                        </div>
                        <div class="xg-value-item">
                            <div class="xg-label">半场xG</div>
                            <div class="xg-value half-time">${xgData.away.halfTime}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 泊松分布概率结果 - 左右分栏布局 -->
            <div class="poisson-layout">
                <!-- 半场泊松分布概率结果（左） -->
                <div class="poisson-probabilities half-time">
                    <h4>半场泊松分布概率预测</h4>
                    
                    <!-- 半场胜平负概率 -->
                    <div class="probability-section">
                        <h5>胜平负概率</h5>
                        <table class="probability-table">
                            <thead>
                                <tr>
                                    <th>结果</th>
                                    <th>概率</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>主胜</td>
                                    <td>${(halfWinDrawLoss.homeWin * 100).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>平局</td>
                                    <td>${(halfWinDrawLoss.draw * 100).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>客胜</td>
                                    <td>${(halfWinDrawLoss.awayWin * 100).toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 半场常见比分组合概率 -->
                    <div class="probability-section">
                        <h5>常见比分组合概率</h5>
                        <table class="probability-table">
                            <thead>
                                <tr>
                                    <th>比分</th>
                                    <th>概率</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${halfScoreCombinations.map(score => `
                                    <tr>
                                        <td>${score.homeGoals}-${score.awayGoals}</td>
                                        <td>${(score.probability * 100).toFixed(2)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 半场总进球数概率 - 柱状图 -->
                    <div class="probability-section">
                        <h5>总进球数概率</h5>
                        <div class="probability-bar-chart">
                            ${halfGoalDistributions.totalGoals.map(total => `
                                <div class="bar-chart-item">
                                    <div class="bar-chart-label">${total.goals}</div>
                                    <div class="bar-chart-bar-container">
                                        <div class="bar-chart-bar" style="width: ${Math.min(total.probability * 100 * 5, 100)}%"></div>
                                    </div>
                                    <div class="bar-chart-value">${(total.probability * 100).toFixed(2)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 半场主队进球数概率 - 柱状图 -->
                    <div class="probability-section">
                        <h5>${homeTeamName}进球数概率</h5>
                        <div class="probability-bar-chart">
                            ${halfGoalDistributions.homeGoals.map(home => `
                                <div class="bar-chart-item">
                                    <div class="bar-chart-label">${home.goals}</div>
                                    <div class="bar-chart-bar-container">
                                        <div class="bar-chart-bar" style="width: ${Math.min(home.probability * 100 * 5, 100)}%"></div>
                                    </div>
                                    <div class="bar-chart-value">${(home.probability * 100).toFixed(2)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 半场客队进球数概率 - 柱状图 -->
                    <div class="probability-section">
                        <h5>${awayTeamName}进球数概率</h5>
                        <div class="probability-bar-chart">
                            ${halfGoalDistributions.awayGoals.map(away => `
                                <div class="bar-chart-item">
                                    <div class="bar-chart-label">${away.goals}</div>
                                    <div class="bar-chart-bar-container">
                                        <div class="bar-chart-bar" style="width: ${Math.min(away.probability * 100 * 5, 100)}%"></div>
                                    </div>
                                    <div class="bar-chart-value">${(away.probability * 100).toFixed(2)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- 全场泊松分布概率结果（右） -->
                <div class="poisson-probabilities full-time">
                    <h4>全场泊松分布概率预测</h4>
                    
                    <!-- 全场胜平负概率 -->
                    <div class="probability-section">
                        <h5>胜平负概率</h5>
                        <table class="probability-table">
                            <thead>
                                <tr>
                                    <th>结果</th>
                                    <th>概率</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>主胜</td>
                                    <td>${(fullWinDrawLoss.homeWin * 100).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>平局</td>
                                    <td>${(fullWinDrawLoss.draw * 100).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>客胜</td>
                                    <td>${(fullWinDrawLoss.awayWin * 100).toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 全场常见比分组合概率 -->
                    <div class="probability-section">
                        <h5>常见比分组合概率</h5>
                        <table class="probability-table">
                            <thead>
                                <tr>
                                    <th>比分</th>
                                    <th>概率</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${fullScoreCombinations.map(score => `
                                    <tr>
                                        <td>${score.homeGoals}-${score.awayGoals}</td>
                                        <td>${(score.probability * 100).toFixed(2)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 全场总进球数概率 - 柱状图 -->
                    <div class="probability-section">
                        <h5>总进球数概率</h5>
                        <div class="probability-bar-chart">
                            ${fullGoalDistributions.totalGoals.map(total => `
                                <div class="bar-chart-item">
                                    <div class="bar-chart-label">${total.goals}</div>
                                    <div class="bar-chart-bar-container">
                                        <div class="bar-chart-bar" style="width: ${Math.min(total.probability * 100 * 5, 100)}%"></div>
                                    </div>
                                    <div class="bar-chart-value">${(total.probability * 100).toFixed(2)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 全场主队进球数概率 - 柱状图 -->
                    <div class="probability-section">
                        <h5>${homeTeamName}进球数概率</h5>
                        <div class="probability-bar-chart">
                            ${fullGoalDistributions.homeGoals.map(home => `
                                <div class="bar-chart-item">
                                    <div class="bar-chart-label">${home.goals}</div>
                                    <div class="bar-chart-bar-container">
                                        <div class="bar-chart-bar" style="width: ${Math.min(home.probability * 100 * 5, 100)}%"></div>
                                    </div>
                                    <div class="bar-chart-value">${(home.probability * 100).toFixed(2)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 全场客队进球数概率 - 柱状图 -->
                    <div class="probability-section">
                        <h5>${awayTeamName}进球数概率</h5>
                        <div class="probability-bar-chart">
                            ${fullGoalDistributions.awayGoals.map(away => `
                                <div class="bar-chart-item">
                                    <div class="bar-chart-label">${away.goals}</div>
                                    <div class="bar-chart-bar-container">
                                        <div class="bar-chart-bar" style="width: ${Math.min(away.probability * 100 * 5, 100)}%"></div>
                                    </div>
                                    <div class="bar-chart-value">${(away.probability * 100).toFixed(2)}%</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- 半全场概率 -->
                    <div class="probability-section">
                        <h5>半全场概率</h5>
                        <table class="probability-table">
                            <thead>
                                <tr>
                                    <th>结果</th>
                                    <th>概率</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(halfFullProbabilities).map(([result, probability]) => `
                                    <tr>
                                        <td>${result}</td>
                                        <td>${(probability * 100).toFixed(2)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * 计算阶乘
     * @param {number} n - 非负整数
     * @returns {number} 阶乘结果
     */
    factorial(n) {
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    },
    
    /**
     * 泊松分布概率质量函数
     * @param {number} k - 事件发生次数（进球数）
     * @param {number} lambda - 事件发生率（xG）
     * @returns {number} 概率值
     */
    poissonProbability(k, lambda) {
        return Math.exp(-lambda) * Math.pow(lambda, k) / this.factorial(k);
    },
    
    /**
     * 计算胜平负概率
     * @param {number} homeXg - 主队xG
     * @param {number} awayXg - 客队xG
     * @returns {Object} 胜平负概率对象
     */
    calculateWinDrawLossProbabilities(homeXg, awayXg) {
        let homeWin = 0;
        let draw = 0;
        let awayWin = 0;
        
        // 计算最多8个进球的情况，足够覆盖绝大多数比赛
        for (let homeGoals = 0; homeGoals <= 8; homeGoals++) {
            for (let awayGoals = 0; awayGoals <= 8; awayGoals++) {
                const prob = this.poissonProbability(homeGoals, homeXg) * this.poissonProbability(awayGoals, awayXg);
                
                if (homeGoals > awayGoals) {
                    homeWin += prob;
                } else if (homeGoals === awayGoals) {
                    draw += prob;
                } else {
                    awayWin += prob;
                }
            }
        }
        
        return {
            homeWin,
            draw,
            awayWin
        };
    },
    
    /**
     * 计算半全场概率
     * @param {number} homeHalfXg - 主队半场xG
     * @param {number} awayHalfXg - 客队半场xG
     * @param {number} homeFullXg - 主队全场xG
     * @param {number} awayFullXg - 客队全场xG
     * @returns {Object} 半全场概率对象
     */
    calculateHalfFullProbabilities(homeHalfXg, awayHalfXg, homeFullXg, awayFullXg) {
        // 半全场9种情况的概率
        const halfFullProb = {
            '胜胜': 0,
            '胜平': 0,
            '胜负': 0,
            '平胜': 0,
            '平平': 0,
            '平负': 0,
            '负胜': 0,
            '负平': 0,
            '负负': 0
        };
        
        // 计算最多8个进球的情况，足够覆盖绝大多数比赛
        for (let homeHalfGoals = 0; homeHalfGoals <= 8; homeHalfGoals++) {
            for (let awayHalfGoals = 0; awayHalfGoals <= 8; awayHalfGoals++) {
                for (let homeFullGoals = 0; homeFullGoals <= 8; homeFullGoals++) {
                    for (let awayFullGoals = 0; awayFullGoals <= 8; awayFullGoals++) {
                        // 半场进球概率
                        const halfProb = this.poissonProbability(homeHalfGoals, homeHalfXg) * this.poissonProbability(awayHalfGoals, awayHalfXg);
                        // 全场进球概率
                        const fullProb = this.poissonProbability(homeFullGoals, homeFullXg) * this.poissonProbability(awayFullGoals, awayFullXg);
                        
                        // 组合概率
                        const prob = halfProb * fullProb;
                        
                        // 确定半场结果
                        let halfResult = '';
                        if (homeHalfGoals > awayHalfGoals) {
                            halfResult = '胜';
                        } else if (homeHalfGoals === awayHalfGoals) {
                            halfResult = '平';
                        } else {
                            halfResult = '负';
                        }
                        
                        // 确定全场结果
                        let fullResult = '';
                        if (homeFullGoals > awayFullGoals) {
                            fullResult = '胜';
                        } else if (homeFullGoals === awayFullGoals) {
                            fullResult = '平';
                        } else {
                            fullResult = '负';
                        }
                        
                        // 更新对应半全场结果的概率
                        const halfFullKey = `${halfResult}${fullResult}`;
                        halfFullProb[halfFullKey] += prob;
                    }
                }
            }
        }
        
        return halfFullProb;
    },
    
    /**
     * 计算常见比分组合概率
     * @param {number} homeXg - 主队xG
     * @param {number} awayXg - 客队xG
     * @returns {Array} 比分组合概率数组
     */
    calculateScoreCombinationProbabilities(homeXg, awayXg) {
        const scoreCombinations = [];
        
        // 计算0-0到4-4的比分组合概率
        for (let homeGoals = 0; homeGoals <= 4; homeGoals++) {
            for (let awayGoals = 0; awayGoals <= 4; awayGoals++) {
                const prob = this.poissonProbability(homeGoals, homeXg) * this.poissonProbability(awayGoals, awayXg);
                if (prob > 0.001) { // 只显示概率大于0.1%的比分
                    scoreCombinations.push({
                        homeGoals,
                        awayGoals,
                        probability: prob
                    });
                }
            }
        }
        
        // 按概率降序排序
        scoreCombinations.sort((a, b) => b.probability - a.probability);
        
        // 只返回前10个最可能的比分
        return scoreCombinations.slice(0, 10);
    },
    
    /**
     * 计算总进球数及各自进球数概率分布
     * @param {number} homeXg - 主队xG
     * @param {number} awayXg - 客队xG
     * @returns {Object} 进球数概率分布对象
     */
    calculateGoalDistributions(homeXg, awayXg) {
        const homeGoals = [];
        const awayGoals = [];
        const totalGoals = [];
        
        // 计算主队进球数概率
        for (let k = 0; k <= 6; k++) {
            homeGoals.push({
                goals: k,
                probability: this.poissonProbability(k, homeXg)
            });
        }
        
        // 计算客队进球数概率
        for (let k = 0; k <= 6; k++) {
            awayGoals.push({
                goals: k,
                probability: this.poissonProbability(k, awayXg)
            });
        }
        
        // 计算总进球数概率
        for (let total = 0; total <= 12; total++) {
            let prob = 0;
            for (let home = 0; home <= total; home++) {
                const away = total - home;
                prob += this.poissonProbability(home, homeXg) * this.poissonProbability(away, awayXg);
            }
            totalGoals.push({
                goals: total,
                probability: prob
            });
        }
        
        return {
            homeGoals,
            awayGoals,
            totalGoals
        };
    },

    /**
     * 从页面获取比赛ID
     * @returns {string|null} 比赛ID
     */
    getMatchIdFromPage() {
        // 尝试从URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('matchId') || urlParams.get('id');
    }
};

// 暴露模块
if (typeof window !== 'undefined') {
    window.matchDataModule = matchDataModule;
}
