// 主入口文件
// 负责初始化所有模块并处理全局事件

// 全局事件处理
(function() {
    // 禁止右键菜单
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // 禁止复制
    document.addEventListener('copy', function(e) {
        e.preventDefault();
    });
    
    // 禁止剪切
    document.addEventListener('cut', function(e) {
        e.preventDefault();
    });
    
    // 禁止粘贴
    document.addEventListener('paste', function(e) {
        e.preventDefault();
    });
    
    // 禁止选择
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
    });
    
    // 禁止拖拽
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
})();

// 页面加载完成后初始化所有模块
document.addEventListener('DOMContentLoaded', function() {
    // 初始化筛选功能
    if (typeof filterModule !== 'undefined') {
        filterModule.init();
    }
    
    // 初始化模态框功能
    if (typeof modalModule !== 'undefined') {
        modalModule.init();
    }
    
    // 初始化智能分析功能
    initSmartAnalysis();
});

// 智能分析功能
function initSmartAnalysis() {
    // 监听子标签切换事件
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sub-tab-btn')) {
            const targetTab = e.target.getAttribute('data-sub-tab');
            if (targetTab === 'smart-analysis') {
                // 当切换到智能分析标签时，生成推荐文
                generateAIRecommendation();
            }
        }
    });
    
    // 监听比赛切换事件
    document.addEventListener('click', function(e) {
        // 监听比赛列表中的比赛点击事件
        if (e.target.closest('tr') && e.target.closest('tr').getAttribute('data-fid')) {
            // 延迟生成推荐文，确保模态框和数据已经加载完成
            setTimeout(function() {
                // 如果当前已经在智能分析标签页，重新生成推荐文
                const activeSubTab = document.querySelector('.sub-tab-btn.active');
                if (activeSubTab && activeSubTab.getAttribute('data-sub-tab') === 'smart-analysis') {
                    generateAIRecommendation();
                }
            }, 1000);
        }
    });
    
    // 监听模态框关闭事件，清除可能的缓存
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('close')) {
            // 重置智能分析内容
            const aiRecommendation = document.getElementById('aiRecommendation');
            if (aiRecommendation) {
                aiRecommendation.innerHTML = '<p>正在生成AI智能分析...</p>';
            }
        }
    });
    
    // 为复制推荐按钮添加事件监听器
    document.addEventListener('click', function(e) {
        if (e.target.id === 'copyRecommendationBtn' || e.target.closest('#copyRecommendationBtn')) {
            copyRecommendation();
        }
    });
}

// 生成智能分析推荐
function generateAIRecommendation() {
    // 显示加载状态
    document.getElementById('aiRecommendation').innerHTML = '<p>正在生成智能分析...</p>';
    
    try {
        // 确保清除所有可能的缓存数据
        clearSmartAnalysisCache();
        
        // 从页面提取数据
        const analysisData = extractDataFromPage();
        
        // 计算评分
        const scores = calculateMatchScores(analysisData);
        
        // 生成推荐文
        const recommendation = generateRecommendationText(analysisData, scores);
        
        // 更新推荐文显示
        document.getElementById('aiRecommendation').innerHTML = `<pre>${recommendation}</pre>`;
        
    } catch (error) {
        console.error('生成智能推荐失败:', error);
        document.getElementById('aiRecommendation').innerHTML = `<p>生成智能推荐失败: ${error.message}</p>`;
    }
}

// 清除智能分析缓存
function clearSmartAnalysisCache() {
    // 重置数据提取函数中的任何缓存
    // 这里可以添加具体的缓存清除逻辑
    console.log('已清除智能分析缓存');
}

// 复制推荐文功能
function copyRecommendation() {
    const recommendationContent = document.querySelector('#aiRecommendation pre');
    if (!recommendationContent) return;
    
    const textToCopy = recommendationContent.textContent;
    
    // 使用Clipboard API复制文本
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            // 静默复制成功
        })
        .catch(err => {
            console.error('复制失败:', err);
            // 静默复制失败
        });
}

// 生成幽默风趣的开场词
function generateFunnyOpening() {
    const openings = [
        '各位彩民朋友大家好！今天AI分析师为您带来一场精彩赛事分析，准备好赢取您的幸运大奖了吗？\n',
        '热血沸腾的足球盛宴即将开始！AI智能分析系统已就位，为您揭秘这场比赛的胜负玄机！\n',
        '精准预测，尽在掌握！AI分析师通过大数据深度挖掘，为您带来本场比赛的独家分析报告！\n',
        '欢迎来到AI智能分析频道！今天我们聚焦这场备受关注的对决，让数据告诉我们答案！\n',
        '强者对决，谁将笑到最后？AI分析师通过多维度数据对比，为您带来专业赛事解读！\n',
        '哈喽，我是您的AI足球分析师！今天我们来聊聊这场比赛，让数据说话，助您精准投注！\n',
        '星光闪耀的赛场，谁能成为本场之星？AI智能分析为您揭晓！\n',
        '足球世界，数据为王！AI分析师通过大数据算法，为您带来本场比赛的科学预测！\n',
        '绿茵场上的戏剧性对决即将上演！AI智能分析系统已准备好为您解析这场比赛的每一个细节！\n',
        '幸运女神眷顾谁？AI分析师通过全面数据评估，为您带来本场比赛的幸运指南！\n'    ];
    
    // 随机选择一个开场词
    return openings[Math.floor(Math.random() * openings.length)];
}

// 提取比赛基本信息
function extractMatchBasicInfo() {
    // 尝试从modal对象获取比赛信息
    if (typeof modalModule !== 'undefined' && modalModule.currentMatchInfo) {
        return {
            league: modalModule.currentMatchInfo.league || '未知联赛',
            round: modalModule.currentMatchInfo.round || '未知轮次',
            time: modalModule.currentMatchInfo.time || '未知时间'
        };
    }
    
    // 尝试从页面提取联赛名、轮次、比赛时间
    // 这里需要根据实际页面结构调整选择器
    const matchInfo = {
        league: '未知联赛',
        round: '未知轮次',
        time: '未知时间'
    };
    
    return matchInfo;
}

// 生成比赛基本信息
function generateMatchBasicInfo() {
    const info = extractMatchBasicInfo();
    return `${info.league} | ${info.round} | ${info.time}\n\n`;
}

// 生成多样化的推荐文开头
function generateDiverseIntroduction() {
    const introductions = [
        '智能分析系统深度解析：本场比赛结合欧赔、亚玩法、大小球、xG数据、泊松分布、球队近期表现、历史交锋、主客场差异等多维度指标，为您呈现专业赛事预测：',
        '全面赛事分析报告：通过智能算法整合欧赔、亚玩法、大小球、xG数据、球队状态、历史交锋等关键信息，为您带来本场比赛的精准解读：',
        '智能预测：综合欧赔、亚玩法、大小球、xG数据、泊松分布及球队近期表现，结合历史交锋和主客场因素，本场比赛的预测结果如下：',
        '专业赛事推荐：基于欧赔、亚玩法、xG数据等多维度指标，结合球队近期状态、历史交锋和防守数据，智能分析系统为您生成权威预测：',
        '深度赛事分析：通过对欧赔、亚玩法、大小球、xG数据、球队近期状态、历史交锋和主客场表现的综合分析，智能分析为您带来本场比赛的专业推荐：'    ];
    
    // 随机选择一个开头
    return introductions[Math.floor(Math.random() * introductions.length)];
}

// 生成多样化的推荐文结尾
function generateDiverseConclusion() {
    const conclusions = [
        '综合以上全方位分析，本场比赛推荐重点关注客胜，建议结合自身经验和其他因素谨慎投注。',
        '综合各方面数据指标，本场比赛推荐主胜，建议合理控制投注金额，理性购彩。',
        '结合多维度数据分析，本场比赛平局可能性较高，可考虑小注投注平局选项。',
        '经过全面深度分析，本场比赛主胜概率较大，推荐主胜，同时可关注大小球走势。',
        '综合所有数据指标，本场比赛客胜机会更大，建议参考其他因素后再做最终决定。',
        '根据智能分析，本场比赛胜负悬念较大，建议观望为主，或选择稳妥的投注策略。',
        '综合各项数据，本场比赛推荐双选主胜和平局，降低投注风险，提高命中概率。',
        '经过全面评估，本场比赛进球数有望较多，建议关注大球选项，同时结合胜平负进行组合投注。'
    ];
    
    // 随机选择一个结尾
    return conclusions[Math.floor(Math.random() * conclusions.length)];
}

// 生成球队状态分析
function generateTeamStatusAnalysis(analysisData) {
    const { overview, teamNames } = analysisData;
    const { recentRecords, headToHead } = overview;
    
    let analysis = '';
    
    if (recentRecords) {
        analysis += `### 球队近期状态分析\n`;
        
        if (recentRecords.home.parsedStats) {
            const homeStats = recentRecords.home.parsedStats;
            analysis += `- ${teamNames.home}：近${homeStats.totalMatches}场比赛${homeStats.wins}胜${homeStats.draws}平${homeStats.losses}负，胜率${homeStats.winRate}%，场均进球${homeStats.avgGoalsFor}个，场均失球${homeStats.avgGoalsAgainst}个`;
            if (homeStats.streak) {
                analysis += `，${homeStats.streak.type === 'win' ? `${homeStats.streak.count}连胜` : `${homeStats.streak.count}连败`}`;
            }
            analysis += `\n`;
        }
        
        if (recentRecords.away.parsedStats) {
            const awayStats = recentRecords.away.parsedStats;
            analysis += `- ${teamNames.away}：近${awayStats.totalMatches}场比赛${awayStats.wins}胜${awayStats.draws}平${awayStats.losses}负，胜率${awayStats.winRate}%，场均进球${awayStats.avgGoalsFor}个，场均失球${awayStats.avgGoalsAgainst}个`;
            if (awayStats.streak) {
                analysis += `，${awayStats.streak.type === 'win' ? `${awayStats.streak.count}连胜` : `${awayStats.streak.count}连败`}`;
            }
            analysis += `\n`;
        }
        
        analysis += `\n`;
    }
    
    if (headToHead && headToHead.parsedStats) {
        const h2h = headToHead.parsedStats;
        analysis += `### 历史交锋分析\n`;
        
        // 根据实际胜负情况判断优势
        let advantageDesc = '';
        if (h2h.wins > h2h.losses) {
            advantageDesc = `占据优势`;
        } else if (h2h.losses > h2h.wins) {
            advantageDesc = `处于下风`;
        } else {
            advantageDesc = `平分秋色`;
        }
        
        // 修复：确保优势描述与实际胜负记录一致
        const actualDominantTeam = teamNames.home;
        const opponentTeam = teamNames.away;
        
        // 确保显示正确的对阵双方和胜负关系
        analysis += `- 双方近${h2h.totalMatches}次交锋，${actualDominantTeam}${h2h.wins}胜${h2h.draws}平${h2h.losses}负，${advantageDesc}\n`;
        
        // 根据实际胜负记录显示正确的优势球队
        const realAdvantageTeam = h2h.wins > h2h.losses ? actualDominantTeam : h2h.losses > h2h.wins ? opponentTeam : '双方';
        analysis += `- 历史交锋中，${realAdvantageTeam}${advantageDesc === '平分秋色' ? '平分秋色' : `占据${advantageDesc}`}\n`;
        analysis += `\n`;
    }
    
    return analysis;
}

// 生成进球与防守分析
function generateGoalsDefenseAnalysis(analysisData) {
    const { stats, teamNames } = analysisData;
    const { xg } = stats;
    
    let analysis = '';
    
    analysis += `### 进球与防守分析\n`;
    analysis += `- ${teamNames.home}全场xG ${xg.home.fullTime}，半场xG ${xg.home.halfTime}，进攻火力${xg.home.fullTime > 1.5 ? '强劲' : '一般'}\n`;
    analysis += `- ${teamNames.away}全场xG ${xg.away.fullTime}，半场xG ${xg.away.halfTime}，进攻端表现${xg.away.fullTime > 1.5 ? '出色' : '一般'}\n`;
    analysis += `- 两队全场总xG ${(xg.home.fullTime + xg.away.fullTime).toFixed(2)}，预期进球${(xg.home.fullTime + xg.away.fullTime) > 3 ? '较多' : '适中'}\n`;
    analysis += `\n`;
    
    return analysis;
}

// 生成投注建议
function generateBettingAdvice(analysisData, scores, recommendation) {
    const { odds } = analysisData;
    
    let advice = '';
    
    advice += `### 投注建议\n`;
    advice += `- 胜平负推荐：${recommendation}，信心等级${scores.homeWin > 60 || scores.awayWin > 60 ? '高' : scores.homeWin > 45 || scores.awayWin > 45 ? '中' : '低'}\n`;
    
    if (odds.oupei.avgCurrent.home > 0) {
        advice += `- 欧赔参考：主胜${odds.oupei.avgCurrent.home}，平局${odds.oupei.avgCurrent.draw}，客胜${odds.oupei.avgCurrent.away}\n`;
    }
    
    advice += `- 风险提示：彩市有风险，投注需谨慎，建议控制投注金额在总资金的5%以内\n`;
    advice += `- 投注策略：建议结合自身经验和其他因素进行综合判断，可考虑双选或组合投注降低风险\n`;
    
    return advice;
}

// 从页面提取数据
function extractDataFromPage() {
    const data = {
        odds: extractOddsData(),
        stats: extractStatsData(),
        teamNames: extractTeamNames(),
        overview: extractOverviewData()
    };
    
    return data;
}

// 提取概览数据
function extractOverviewData() {
    const overview = {
        recentRecords: extractRecentRecords(),
        homeAwayRecords: extractHomeAwayRecords(),
        headToHead: extractHeadToHead()
    };
    
    return overview;
}

// 提取近期战绩数据
function extractRecentRecords() {
    const recentRecordsContainer = document.getElementById('recentRecordsContainer');
    if (!recentRecordsContainer) {
        return null;
    }
    
    const teamRecords = recentRecordsContainer.querySelectorAll('.team-records');
    const recentRecords = {
        home: {
            name: '',
            stats: '',
            parsedStats: null
        },
        away: {
            name: '',
            stats: '',
            parsedStats: null
        }
    };
    
    teamRecords.forEach((teamRecord, index) => {
        const teamName = teamRecord.querySelector('h5').textContent;
        const statsText = teamRecord.querySelector('.team-stats').textContent;
        
        const parsedStats = parseTeamStats(statsText);
        
        if (index === 0) {
            recentRecords.home = {
                name: teamName,
                stats: statsText,
                parsedStats: parsedStats
            };
        } else {
            recentRecords.away = {
                name: teamName,
                stats: statsText,
                parsedStats: parsedStats
            };
        }
    });
    
    return recentRecords;
}

// 提取主客场战绩数据
function extractHomeAwayRecords() {
    const homeAwayRecordsContainer = document.getElementById('homeAwayRecordsContainer');
    if (!homeAwayRecordsContainer) {
        return null;
    }
    
    const teamRecords = homeAwayRecordsContainer.querySelectorAll('.team-records');
    const homeAwayRecords = {
        home: {
            name: '',
            stats: '',
            parsedStats: null
        },
        away: {
            name: '',
            stats: '',
            parsedStats: null
        }
    };
    
    teamRecords.forEach((teamRecord, index) => {
        const teamName = teamRecord.querySelector('h5').textContent;
        const statsText = teamRecord.querySelector('.team-stats').textContent;
        
        const parsedStats = parseTeamStats(statsText);
        
        if (index === 0) {
            homeAwayRecords.home = {
                name: teamName,
                stats: statsText,
                parsedStats: parsedStats
            };
        } else {
            homeAwayRecords.away = {
                name: teamName,
                stats: statsText,
                parsedStats: parsedStats
            };
        }
    });
    
    return homeAwayRecords;
}

// 提取历史交战记录数据
function extractHeadToHead() {
    const headToHeadContainer = document.getElementById('headToHeadContainer');
    if (!headToHeadContainer) {
        return null;
    }
    
    const statsText = headToHeadContainer.querySelector('.head-to-head-stats')?.textContent;
    const parsedStats = parseHeadToHeadStats(statsText);
    
    return {
        stats: statsText,
        parsedStats: parsedStats
    };
}

// 解析球队战绩统计文本
function parseTeamStats(statsText) {
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
    
    // 检查是否有连胜或连败
    const streak = checkStreak(statsText);
    
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
        avgGoalsAgainst,
        streak
    };
}

// 解析历史交战记录统计文本
function parseHeadToHeadStats(statsText) {
    if (!statsText || typeof statsText !== 'string') {
        return null;
    }
    
    // 匹配交战历史数据的正则表达式
    const regex = /双方近(\d+)次交战，([^，]+)(\d+)胜(\d+)平(\d+)负，进(\d+)球，失(\d+)球/;
    const match = statsText.match(regex);
    
    if (!match) {
        return null;
    }
    
    const totalMatches = parseInt(match[1]);
    const teamName = match[2];
    const wins = parseInt(match[3]);
    const draws = parseInt(match[4]);
    const losses = parseInt(match[5]);
    const goalsFor = parseInt(match[6]);
    const goalsAgainst = parseInt(match[7]);
    
    // 计算胜率、平率、负率
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;
    const drawRate = totalMatches > 0 ? ((draws / totalMatches) * 100).toFixed(1) : 0;
    const lossRate = totalMatches > 0 ? ((losses / totalMatches) * 100).toFixed(1) : 0;
    
    // 根据实际胜负记录确定优势球队
    const dominantTeam = wins > losses ? teamName : losses > wins ? '对手' : teamName;
    
    return {
        totalMatches,
        dominantTeam,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        winRate,
        drawRate,
        lossRate
    };
}

// 检查球队是否有连胜或连败
function checkStreak(statsText) {
    if (!statsText || typeof statsText !== 'string') {
        return null;
    }
    
    // 查找连胜或连败信息
    const winStreakRegex = /(\d+)连胜/;
    const loseStreakRegex = /(\d+)连败/;
    
    const winStreakMatch = statsText.match(winStreakRegex);
    const loseStreakMatch = statsText.match(loseStreakRegex);
    
    if (winStreakMatch) {
        return { type: 'win', count: parseInt(winStreakMatch[1]) };
    } else if (loseStreakMatch) {
        return { type: 'lose', count: parseInt(loseStreakMatch[1]) };
    }
    
    return null;
}

// 从赔率分析提取数据
function extractOddsData() {
    const oupeiStats = document.getElementById('oupeiStats');
    const marginStats = document.getElementById('marginStats');
    const daxiaoStats = document.getElementById('daxiaoStats');
    
    if (!oupeiStats || !marginStats || !daxiaoStats) {
        throw new Error('无法获取赔率数据，请先查看赔率分析标签页');
    }
    
    // 提取欧赔数据
    const oupeiData = extractOupeiData(oupeiStats);
    
    // 提取亚盘数据
    const yapanData = extractYapanData(marginStats);
    
    // 提取大小球数据
    const daxiaoData = extractDaxiaoData(daxiaoStats);
    
    return {
        oupei: oupeiData,
        yapan: yapanData,
        daxiao: daxiaoData
    };
}

// 提取欧赔数据
function extractOupeiData(container) {
    const rows = container.querySelectorAll('.stats-row');
    const data = {
        avgInitial: { home: 0, draw: 0, away: 0 },
        avgCurrent: { home: 0, draw: 0, away: 0 },
        margin: { initial: 0, current: 0 }
    };
    
    rows.forEach(row => {
        const label = row.querySelector('.stats-label').textContent;
        const value = row.querySelector('.stats-value').textContent;
        
        if (label.includes('平均初值赔率')) {
            const match = value.match(/主胜: ([\d.]+) \| 平局: ([\d.]+) \| 客胜: ([\d.]+)/);
            if (match) {
                data.avgInitial = {
                    home: parseFloat(match[1]),
                    draw: parseFloat(match[2]),
                    away: parseFloat(match[3])
                };
            }
        } else if (label.includes('平均即时赔率')) {
            const match = value.match(/主胜: ([\d.]+) \| 平局: ([\d.]+) \| 客胜: ([\d.]+)/);
            if (match) {
                data.avgCurrent = {
                    home: parseFloat(match[1]),
                    draw: parseFloat(match[2]),
                    away: parseFloat(match[3])
                };
            }
        } else if (label.includes('欧赔初值Margin')) {
            const match = value.match(/([\d.]+)%/);
            if (match) {
                data.margin.initial = parseFloat(match[1]);
            }
        } else if (label.includes('欧赔即时Margin')) {
            const match = value.match(/([\d.]+)%/);
            if (match) {
                data.margin.current = parseFloat(match[1]);
            }
        }
    });
    
    return data;
}

// 提取亚盘数据
function extractYapanData(container) {
    const rows = container.querySelectorAll('.stats-row');
    const data = {
        avgInitial: { home: 0, away: 0 },
        avgCurrent: { home: 0, away: 0 },
        avgHandicap: { initial: 0, current: 0 }
    };
    
    rows.forEach(row => {
        const label = row.querySelector('.stats-label').textContent;
        const value = row.querySelector('.stats-value').textContent;
        
        if (label.includes('平均初值赔率')) {
            const match = value.match(/主队: ([\d.]+) \| 客队: ([\d.]+)/);
            if (match) {
                data.avgInitial = {
                    home: parseFloat(match[1]),
                    away: parseFloat(match[2])
                };
            }
        } else if (label.includes('平均即时赔率')) {
            const match = value.match(/主队: ([\d.]+) \| 客队: ([\d.]+)/);
            if (match) {
                data.avgCurrent = {
                    home: parseFloat(match[1]),
                    away: parseFloat(match[2])
                };
            }
        } else if (label.includes('平均初值玩法')) {
            data.avgHandicap.initial = parseFloat(value);
        } else if (label.includes('平均即时玩法')) {
            data.avgHandicap.current = parseFloat(value);
        }
    });
    
    return data;
}

// 提取大小球数据
function extractDaxiaoData(container) {
    const rows = container.querySelectorAll('.stats-row');
    const data = {
        avgInitial: { over: 0, under: 0 },
        avgCurrent: { over: 0, under: 0 },
        avgLine: { initial: 0, current: 0 }
    };
    
    rows.forEach(row => {
        const label = row.querySelector('.stats-label').textContent;
        const value = row.querySelector('.stats-value').textContent;
        
        if (label.includes('平均初值赔率')) {
            const match = value.match(/大球: ([\d.]+) \| 小球: ([\d.]+)/);
            if (match) {
                data.avgInitial = {
                    over: parseFloat(match[1]),
                    under: parseFloat(match[2])
                };
            }
        } else if (label.includes('平均即时赔率')) {
            const match = value.match(/大球: ([\d.]+) \| 小球: ([\d.]+)/);
            if (match) {
                data.avgCurrent = {
                    over: parseFloat(match[1]),
                    under: parseFloat(match[2])
                };
            }
        } else if (label.includes('平均初值玩法')) {
            data.avgLine.initial = parseFloat(value);
        } else if (label.includes('平均即时玩法')) {
            data.avgLine.current = parseFloat(value);
        }
    });
    
    return data;
}

// 从数据分析提取数据
function extractStatsData() {
    const comprehensiveData = document.getElementById('comprehensiveData');
    if (!comprehensiveData) {
        throw new Error('无法获取数据分析，请先查看数据分析标签页');
    }
    
    // 提取xG数据
    const xgData = extractXgData(comprehensiveData);
    
    // 提取泊松分布数据
    const poissonData = extractPoissonData(comprehensiveData);
    
    return {
        xg: xgData,
        poisson: poissonData
    };
}

// 提取xG数据
function extractXgData(container) {
    const xgCards = container.querySelectorAll('.team-xg-card');
    if (xgCards.length < 2) {
        throw new Error('无法获取xG数据');
    }
    
    const xgData = {
        home: { fullTime: 0, halfTime: 0 },
        away: { fullTime: 0, halfTime: 0 }
    };
    
    // 主队xG数据
    const homeXgValues = xgCards[0].querySelectorAll('.xg-value');
    if (homeXgValues.length >= 2) {
        xgData.home.fullTime = parseFloat(homeXgValues[0].textContent);
        xgData.home.halfTime = parseFloat(homeXgValues[1].textContent);
    }
    
    // 客队xG数据
    const awayXgValues = xgCards[1].querySelectorAll('.xg-value');
    if (awayXgValues.length >= 2) {
        xgData.away.fullTime = parseFloat(awayXgValues[0].textContent);
        xgData.away.halfTime = parseFloat(awayXgValues[1].textContent);
    }
    
    return xgData;
}

// 提取泊松分布数据
function extractPoissonData(container) {
    const poissonSections = container.querySelectorAll('.poisson-probabilities');
    if (poissonSections.length < 1) {
        throw new Error('无法获取泊松分布数据');
    }
    
    const poissonData = {
        halfTime: { homeWin: 0, draw: 0, awayWin: 0 },
        fullTime: { homeWin: 0, draw: 0, awayWin: 0 }
    };
    
    // 提取半场泊松数据
    const halfTimePoisson = container.querySelector('.poisson-probabilities.half-time');
    if (halfTimePoisson) {
        const halfTimeProb = extractPoissonProbabilities(halfTimePoisson);
        poissonData.halfTime = halfTimeProb;
    }
    
    // 提取全场泊松数据
    const fullTimePoisson = container.querySelector('.poisson-probabilities.full-time');
    if (fullTimePoisson) {
        const fullTimeProb = extractPoissonProbabilities(fullTimePoisson);
        poissonData.fullTime = fullTimeProb;
    }
    
    return poissonData;
}

// 提取泊松分布概率
function extractPoissonProbabilities(container) {
    const probTable = container.querySelector('.probability-table');
    if (!probTable) {
        throw new Error('无法获取泊松分布概率数据');
    }
    
    const probabilities = { homeWin: 0, draw: 0, awayWin: 0 };
    const rows = probTable.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const result = row.querySelector('td:first-child').textContent;
        const probText = row.querySelector('td:last-child').textContent;
        const prob = parseFloat(probText.replace('%', ''));
        
        if (result.includes('主胜')) {
            probabilities.homeWin = prob;
        } else if (result.includes('平局')) {
            probabilities.draw = prob;
        } else if (result.includes('客胜')) {
            probabilities.awayWin = prob;
        }
    });
    
    return probabilities;
}

// 提取球队名称
function extractTeamNames() {
    // 从模态框标题获取球队名称
    const modalTitle = document.querySelector('.modal-title');
    if (modalTitle) {
        const titleText = modalTitle.textContent;
        const teams = titleText.split('-');
        if (teams.length === 2) {
            return {
                home: teams[0].trim(),
                away: teams[1].trim()
            };
        }
    }
    
    // 从xG卡片获取球队名称
    const xgCards = document.querySelectorAll('.team-xg-card');
    if (xgCards.length >= 2) {
        const homeName = xgCards[0].querySelector('.team-xg-header h5').textContent;
        const awayName = xgCards[1].querySelector('.team-xg-header h5').textContent;
        
        if (homeName && awayName) {
            return {
                home: homeName,
                away: awayName
            };
        }
    }
    
    // 默认值
    return {
        home: '主队',
        away: '客队'
    };
}

// 计算比赛评分
function calculateMatchScores(analysisData) {
    const { odds, stats } = analysisData;
    
    // 基于欧赔计算胜率
    const oupeiHome = odds.oupei.avgCurrent.home;
    const oupeiDraw = odds.oupei.avgCurrent.draw;
    const oupeiAway = odds.oupei.avgCurrent.away;
    
    let oupeiHomeWin = 0;
    let oupeiDrawWin = 0;
    let oupeiAwayWin = 0;
    
    // 检查是否有有效欧赔数据
    if (oupeiHome > 0 && oupeiDraw > 0 && oupeiAway > 0) {
        // 计算隐含概率（赔率越高，隐含概率越低）
        const impliedHome = 1 / oupeiHome;
        const impliedDraw = 1 / oupeiDraw;
        const impliedAway = 1 / oupeiAway;
        
        // 计算Margin（抽水）
        const margin = impliedHome + impliedDraw + impliedAway;
        
        // 标准化隐含概率，去除Margin影响
        const normalizedHome = impliedHome / margin;
        const normalizedDraw = impliedDraw / margin;
        const normalizedAway = impliedAway / margin;
        
        // 转换为百分比
        oupeiHomeWin = normalizedHome * 100;
        oupeiDrawWin = normalizedDraw * 100;
        oupeiAwayWin = normalizedAway * 100;
    }
    
    // 基于xG计算胜率
    const xgHome = stats.xg.home.fullTime;
    const xgAway = stats.xg.away.fullTime;
    const xgSum = xgHome + xgAway;
    const xgHomeWin = xgSum > 0 ? (xgHome / xgSum) * 100 : 0;
    const xgAwayWin = xgSum > 0 ? (xgAway / xgSum) * 100 : 0;
    const xgDrawWin = Math.max(0, 100 - xgHomeWin - xgAwayWin);
    
    // 基于泊松分布计算胜率
    const poissonHomeWin = stats.poisson.fullTime.homeWin || stats.poisson.halfTime.homeWin;
    const poissonDrawWin = stats.poisson.fullTime.draw || stats.poisson.halfTime.draw;
    const poissonAwayWin = stats.poisson.fullTime.awayWin || stats.poisson.halfTime.awayWin;
    
    // 加权平均计算最终评分
    let homeWin, drawWin, awayWin;
    
    // 检查是否有有效欧赔数据，调整权重
    if (oupeiHome > 0 && oupeiDraw > 0 && oupeiAway > 0) {
        // 优化权重分配：提高欧赔权重（反映市场共识），保持xG数据重要性，略微降低泊松分布权重
        homeWin = Math.round((oupeiHomeWin * 0.5 + xgHomeWin * 0.3 + poissonHomeWin * 0.2));
        drawWin = Math.round((oupeiDrawWin * 0.5 + xgDrawWin * 0.3 + poissonDrawWin * 0.2));
        awayWin = Math.round((oupeiAwayWin * 0.5 + xgAwayWin * 0.3 + poissonAwayWin * 0.2));
    } else {
        // 没有欧赔数据时，提高xG数据权重，略微降低泊松分布权重
        homeWin = Math.round((xgHomeWin * 0.55 + poissonHomeWin * 0.45));
        drawWin = Math.round((xgDrawWin * 0.55 + poissonDrawWin * 0.45));
        awayWin = Math.round((xgAwayWin * 0.55 + poissonAwayWin * 0.45));
    }
    
    return {
        homeWin: homeWin,
        draw: drawWin,
        awayWin: awayWin
    };
}



// 生成推荐文
function generateRecommendationText(analysisData, scores) {
    const { odds, stats, teamNames, overview } = analysisData;
    
    // 基于综合评分获取推荐结果（结合欧赔、xG、泊松分布）
    let recommendation = '';
    let confidence = '';
    
    // 根据综合评分确定推荐结果
    if (scores.homeWin > scores.awayWin && scores.homeWin > scores.draw) {
        recommendation = '主胜';
        confidence = scores.homeWin > 60 ? '高' : scores.homeWin > 45 ? '中' : '低';
    } else if (scores.awayWin > scores.homeWin && scores.awayWin > scores.draw) {
        recommendation = '客胜';
        confidence = scores.awayWin > 60 ? '高' : scores.awayWin > 45 ? '中' : '低';
    } else {
        recommendation = '平局';
        confidence = scores.draw > 40 ? '高' : scores.draw > 30 ? '中' : '低';
    }
    
    // 执行矛盾检测
    const contradictionWarnings = performContradictionDetection(analysisData, scores, recommendation);
    
    // 综合分析，将各数据维度相互印证
    const comprehensiveAnalysis = performComprehensiveAnalysis(analysisData, scores, recommendation, contradictionWarnings);
    
    // 生成亚盘推荐
    const yapanRecommend = generateYapanRecommendation(odds.yapan, recommendation, teamNames);
    
    // 生成大小球推荐
    const daxiaoRecommend = generateDaxiaoRecommendation(odds.daxiao, stats.xg);
    
    // 生成进球数推荐
    const goalsRecommend = generateGoalsRecommendation(stats.xg);
    
    // 生成比分推荐
    const scoreRecommend = generateScoreRecommendation(stats.xg, recommendation);
    
    // 生成半场比分推荐
    const halfTimeScoreRecommend = generateHalfTimeScoreRecommendation(stats.xg);
    
    // 生成半全场组合推荐
    const halfFullRecommend = generateHalfFullRecommendation(stats.xg, recommendation);
    
    // 生成符合主流平台风格的推荐文
    let article = `${generateFunnyOpening()}\n【赛事分析推荐】${teamNames.home} vs ${teamNames.away}\n\n`;
    
    // 添加比赛基本信息
    article += `${generateMatchBasicInfo()}`;
    
    // 使用符合主流平台风格的开头
    article += `综合欧赔、亚玩法、大小球、xG数据、球队近期表现、历史交锋等多维度指标，为您呈现专业赛事预测：\n\n`;
    
    article += `## 核心数据解读\n\n`;
    
    article += `1. 赔率与球队状态综合分析：\n${comprehensiveAnalysis.oddsAndForm}\n\n`;
    
    article += `2. 玩法变化与进攻火力分析：\n${comprehensiveAnalysis.handicapAndAttack}\n\n`;
    
    article += `3. 大小球与进球预期分析：\n${comprehensiveAnalysis.overUnderAndGoals}\n\n`;
    
    article += `4. 历史交锋与近期表现印证：\n${comprehensiveAnalysis.historyAndRecent}\n\n`;
    
    article += `5. 概率模型综合验证：\n${comprehensiveAnalysis.probabilityVerification}\n\n`;
    
    // 增加球队状态分析
    article += `${generateTeamStatusAnalysis(analysisData)}`;
    
    // 增加进球与防守分析
    article += `${generateGoalsDefenseAnalysis(analysisData)}`;
    
    article += `## 综合评分与推荐\n\n`;
    
    article += `综合评分：主胜 ${scores.homeWin}%，平局 ${scores.draw}%，客胜 ${scores.awayWin}%。\n\n`;
    
    article += `【推荐汇总】\n`;
    // 胜平负推荐（突出高信心）
    if (confidence === '高') {
        article += `胜平负推荐：${recommendation}（信心高 - 特别看好）\n`;
    } else {
        article += `胜平负推荐：${recommendation}（信心${confidence}）\n`;
    }
    // 亚玩法推荐（突出高信心）
    if (yapanRecommend.includes('信心高')) {
        article += `亚玩法推荐：${yapanRecommend.replace('（信心高）', '（信心高 - 特别看好）')}\n`;
    } else {
        article += `亚玩法推荐：${yapanRecommend}\n`;
    }
    // 大小球推荐（突出高信心）
    if (daxiaoRecommend.includes('信心高')) {
        article += `大小球推荐：${daxiaoRecommend.replace('（信心高）', '（信心高 - 特别看好）')}\n`;
    } else {
        article += `大小球推荐：${daxiaoRecommend}\n`;
    }
    // 进球数推荐（突出高信心）
    if (goalsRecommend.includes('信心高')) {
        article += `进球数推荐：${goalsRecommend.replace('（信心高）', '（信心高 - 特别看好）')}\n`;
    } else {
        article += `进球数推荐：${goalsRecommend}\n`;
    }
    article += `全场比分推荐：${scoreRecommend}\n`;
    article += `半场比分推荐：${halfTimeScoreRecommend}\n`;
    article += `半全场组合：${halfFullRecommend}\n\n`;
    
    // 添加矛盾检测警告（如果有）
    if (contradictionWarnings && contradictionWarnings.length > 0) {
        article += `【数据矛盾提示】\n`;
        contradictionWarnings.forEach((warning, index) => {
            article += `${index + 1}. ${warning}\n`;
        });
        article += `\n`;
    }
    
    // 增加投注建议
    article += `${generateBettingAdvice(analysisData, scores, recommendation)}`;
    
    // 使用符合主流平台风格的结尾
    article += `${generateDiverseConclusion()}\n\n`;
    
    article += `⚠️ 注：本推荐仅供参考，购彩有风险，投资需谨慎！\n`;
    article += `📅 更新时间：${new Date().toLocaleString('zh-CN')}`;
    
    return article;
}

// 生成亚玩法推荐
function generateYapanRecommendation(yapanData, matchResult, teamNames) {
    const currentHandicap = yapanData.avgHandicap.current;
    const homeOdds = yapanData.avgCurrent.home;
    const awayOdds = yapanData.avgCurrent.away;
    
    let handicapText = '';
    let handicapRecommend = '';
    
    // 检查是否有有效亚玩法数据
    if (currentHandicap === 0 && homeOdds === 0 && awayOdds === 0) {
        return '亚玩法数据缺失（信心无）';
    }
    
    // 格式化玩法文本
    if (currentHandicap < 0.5) {
        handicapText = '平手';
    } else if (currentHandicap === 0.5) {
        handicapText = '半球';
    } else if (currentHandicap === 1.0) {
        handicapText = '一球';
    } else if (currentHandicap === 1.5) {
        handicapText = '一球/球半';
    } else if (currentHandicap === 2.0) {
        handicapText = '两球';
    } else {
        handicapText = `${currentHandicap}球`;
    }
    
    // 生成亚玩法推荐
    if (matchResult === '主胜') {
        if (homeOdds < awayOdds) {
            handicapRecommend = `${teamNames.home} ${handicapText}（平均玩法，信心${homeOdds < 1.9 ? '高' : '中'}）`;
        } else {
            handicapRecommend = `${teamNames.home} +${currentHandicap}（平均玩法，信心${awayOdds < 1.9 ? '高' : '中'}）`;
        }
    } else if (matchResult === '客胜') {
        if (awayOdds < homeOdds) {
            handicapRecommend = `${teamNames.away} +${currentHandicap}（平均玩法，信心${awayOdds < 1.9 ? '高' : '中'}）`;
        } else {
            handicapRecommend = `${teamNames.away} ${handicapText}（平均玩法，信心${homeOdds < 1.9 ? '高' : '中'}）`;
        }
    } else {
        handicapRecommend = `平局走水（平均玩法，信心中）`;
    }
    
    return handicapRecommend;
}

// 生成大小球推荐
function generateDaxiaoRecommendation(daxiaoData, xgData) {
    const currentLine = daxiaoData.avgLine.current;
    const totalXg = xgData.home.fullTime + xgData.away.fullTime;
    const overOdds = daxiaoData.avgCurrent.over;
    const underOdds = daxiaoData.avgCurrent.under;
    
    // 检查是否有有效大小球数据
    if (currentLine === 0 && overOdds === 0 && underOdds === 0) {
        return '大小球数据缺失（信心无）';
    }
    
    let daxiaoRecommend = '';
    let confidence = '';
    
    if (totalXg > currentLine + 0.5) {
        daxiaoRecommend = `大${currentLine}`;
        confidence = overOdds < 1.9 ? '高' : '中';
    } else if (totalXg < currentLine - 0.5) {
        daxiaoRecommend = `小${currentLine}`;
        confidence = underOdds < 1.9 ? '高' : '中';
    } else {
        if (overOdds < underOdds) {
            daxiaoRecommend = `大${currentLine}`;
        } else {
            daxiaoRecommend = `小${currentLine}`;
        }
        confidence = '中';
    }
    
    return `${daxiaoRecommend}（平均玩法，信心${confidence}）`;
}

// 生成进球数推荐
function generateGoalsRecommendation(xgData) {
    const totalXg = xgData.home.fullTime + xgData.away.fullTime;
    
    let goalsRecommend = '';
    
    if (totalXg < 1.5) {
        goalsRecommend = '0-1球（信心高）';
    } else if (totalXg < 2.5) {
        goalsRecommend = '1-2球（信心高）';
    } else if (totalXg < 3.5) {
        goalsRecommend = '2-3球（信心中）';
    } else if (totalXg < 4.5) {
        goalsRecommend = '3-4球（信心中）';
    } else {
        goalsRecommend = '4+球（信心高）';
    }
    
    return goalsRecommend;
}

// 生成比分推荐
function generateScoreRecommendation(xgData, matchResult) {
    const homeXg = xgData.home.fullTime;
    const awayXg = xgData.away.fullTime;
    
    // 基于xG数据生成预期比分
    let homeGoals = Math.round(homeXg);
    let awayGoals = Math.round(awayXg);
    
    // 确保比分与胜平负推荐一致
    if (matchResult === '主胜' && homeGoals <= awayGoals) {
        homeGoals = awayGoals + 1;
    } else if (matchResult === '客胜' && awayGoals <= homeGoals) {
        awayGoals = homeGoals + 1;
    } else if (matchResult === '平局' && homeGoals !== awayGoals) {
        // 平局情况下，调整为最接近的平局比分
        if (Math.abs(homeGoals - awayGoals) === 1) {
            if (homeGoals > awayGoals) {
                awayGoals = homeGoals;
            } else {
                homeGoals = awayGoals;
            }
        } else {
            homeGoals = Math.max(homeGoals, awayGoals);
            awayGoals = homeGoals;
        }
    }
    
    // 生成主要比分推荐和备选比分
    const primaryScore = `${homeGoals}-${awayGoals}`;
    const altScore1 = `${homeGoals + 1}-${awayGoals}`;
    const altScore2 = `${homeGoals}-${awayGoals + 1}`;
    
    return `${primaryScore}（备选：${altScore1}、${altScore2}）`;
}

// 生成半场比分推荐
function generateHalfTimeScoreRecommendation(xgData) {
    const homeHalfTimeXg = xgData.home.halfTime;
    const awayHalfTimeXg = xgData.away.halfTime;
    
    // 基于半场xG数据生成预期半场比分
    let homeHalfGoals = Math.round(homeHalfTimeXg);
    let awayHalfGoals = Math.round(awayHalfTimeXg);
    
    // 生成主要半场比分推荐和备选比分
    const primaryHalfScore = `${homeHalfGoals}-${awayHalfGoals}`;
    const altHalfScore1 = `${homeHalfGoals + 1}-${awayHalfGoals}`;
    const altHalfScore2 = `${homeHalfGoals}-${awayHalfGoals + 1}`;
    
    return `${primaryHalfScore}（备选：${altHalfScore1}、${altHalfScore2}）`;
}

// 生成半全场组合推荐
function generateHalfFullRecommendation(xgData, matchResult) {
    const homeHalfTimeXg = xgData.home.halfTime;
    const awayHalfTimeXg = xgData.away.halfTime;
    
    // 计算半场预期结果
    const halfTimeResult = homeHalfTimeXg > awayHalfTimeXg ? '胜' : homeHalfTimeXg < awayHalfTimeXg ? '负' : '平';
    
    // 生成主要半全场组合
    const fullTimeResult = matchResult === '主胜' ? '胜' : matchResult === '客胜' ? '负' : '平';
    const primaryCombination = `${halfTimeResult}${fullTimeResult}`;
    
    // 生成备选半全场组合（体彩常见的九种组合）
    const allCombinations = ['胜胜', '胜平', '胜负', '平胜', '平平', '平负', '负胜', '负平', '负负'];
    
    // 根据比赛特点筛选可能的备选组合
    const altCombinations = [];
    
    // 基于半场xG和全场结果生成备选组合
    if (halfTimeResult === '胜') {
        // 半场主队领先，可能的组合
        altCombinations.push('胜胜', '胜平', '胜负');
    } else if (halfTimeResult === '平') {
        // 半场平局，可能的组合
        altCombinations.push('平胜', '平平', '平负');
    } else {
        // 半场客队领先，可能的组合
        altCombinations.push('负胜', '负平', '负负');
    }
    
    // 移除主要组合，避免重复
    const filteredAltCombinations = altCombinations.filter(comb => comb !== primaryCombination);
    
    // 取前两个作为备选
    const selectedAltCombinations = filteredAltCombinations.slice(0, 2);
    
    return `${primaryCombination}（备选：${selectedAltCombinations.join('、')}）`;
}

// 执行矛盾检测
function performContradictionDetection(analysisData, scores, recommendation) {
    const { odds, stats, overview } = analysisData;
    const { oupei } = odds;
    const { poisson, xg } = stats;
    const { recentRecords } = overview;
    
    const warnings = [];
    
    // 1. 检查欧赔隐含概率与综合评分的差异
    if (oupei.avgCurrent.home > 0 && oupei.avgCurrent.draw > 0 && oupei.avgCurrent.away > 0) {
        const impliedHome = 1 / oupei.avgCurrent.home;
        const impliedDraw = 1 / oupei.avgCurrent.draw;
        const impliedAway = 1 / oupei.avgCurrent.away;
        const margin = impliedHome + impliedDraw + impliedAway;
        
        const normalizedHome = (impliedHome / margin) * 100;
        const normalizedAway = (impliedAway / margin) * 100;
        
        if (recommendation === '主胜' && Math.abs(normalizedHome - scores.homeWin) > 25) {
            warnings.push('欧赔隐含概率与综合评分主胜结果存在较大差异');
        } else if (recommendation === '客胜' && Math.abs(normalizedAway - scores.awayWin) > 25) {
            warnings.push('欧赔隐含概率与综合评分客胜结果存在较大差异');
        }
    }
    
    // 2. 检查泊松分布与综合评分的差异
    const poissonFullTime = poisson.fullTime;
    if (recommendation === '主胜' && Math.abs(poissonFullTime.homeWin - scores.homeWin) > 25) {
        warnings.push('泊松分布与综合评分主胜结果存在较大差异');
    } else if (recommendation === '客胜' && Math.abs(poissonFullTime.awayWin - scores.awayWin) > 25) {
        warnings.push('泊松分布与综合评分客胜结果存在较大差异');
    } else if (recommendation === '平局' && Math.abs(poissonFullTime.draw - scores.draw) > 25) {
        warnings.push('泊松分布与综合评分平局结果存在较大差异');
    }
    
    // 3. 检查球队近期表现与推荐结果的一致性
    if (recentRecords) {
        const homeStats = recentRecords.home.parsedStats;
        const awayStats = recentRecords.away.parsedStats;
        
        if (homeStats && awayStats) {
            const homeWinRate = parseFloat(homeStats.winRate);
            const awayWinRate = parseFloat(awayStats.winRate);
            
            if (recommendation === '主胜' && homeWinRate < 20 && awayWinRate > 40) {
                warnings.push('主队近期胜率较低，而客队胜率较高，与主胜推荐存在矛盾');
            } else if (recommendation === '客胜' && awayWinRate < 20 && homeWinRate > 40) {
                warnings.push('客队近期胜率较低，而主队胜率较高，与客胜推荐存在矛盾');
            }
        }
    }
    
    // 4. 检查xG数据与推荐结果的一致性
    const xgHome = xg.home.fullTime;
    const xgAway = xg.away.fullTime;
    
    if (recommendation === '主胜' && xgHome < xgAway - 0.5) {
        warnings.push('主队xG值低于客队，与主胜推荐存在矛盾');
    } else if (recommendation === '客胜' && xgAway < xgHome - 0.5) {
        warnings.push('客队xG值低于主队，与客胜推荐存在矛盾');
    }
    
    return warnings;
}

// 执行综合分析
function performComprehensiveAnalysis(analysisData, scores, recommendation, contradictionWarnings = []) {
    const { odds, stats, teamNames, overview } = analysisData;
    
    // 1. 赔率与球队状态综合分析
    const oddsAndForm = analyzeOddsAndForm(odds, overview, teamNames, recommendation, stats);
    
    // 2. 盘口变化与进攻火力分析
    const handicapAndAttack = analyzeHandicapAndAttack(odds, stats, teamNames);
    
    // 3. 大小球与进球预期分析
    const overUnderAndGoals = analyzeOverUnderAndGoals(odds, stats);
    
    // 4. 历史交锋与近期表现印证
    const historyAndRecent = analyzeHistoryAndRecent(overview, teamNames, recommendation);
    
    // 5. 概率模型综合验证（加入赔率分析和Margin数据）
    const probabilityVerification = analyzeProbabilityVerification(odds, stats, scores, teamNames, recommendation);
    
    return {
        oddsAndForm,
        handicapAndAttack,
        overUnderAndGoals,
        historyAndRecent,
        probabilityVerification,
        contradictionWarnings
    };
}

// 分析赔率与球队状态
function analyzeOddsAndForm(odds, overview, teamNames, recommendation, stats) {
    const { oupei, yapan, daxiao } = odds;
    const { recentRecords } = overview;
    const { poisson } = stats;
    
    // 格式化赔率显示，处理0值情况
    const homeWinOdds = oupei.avgCurrent.home > 0 ? oupei.avgCurrent.home : '暂无数据';
    const drawOdds = oupei.avgCurrent.draw > 0 ? oupei.avgCurrent.draw : '暂无数据';
    const awayWinOdds = oupei.avgCurrent.away > 0 ? oupei.avgCurrent.away : '暂无数据';
    
    // 获取Margin数据
    const oupeiMargin = oupei.avgCurrent.margin || 0;
    
    // 获取泊松分布概率作为估计值
    const poissonHome = poisson.fullTime.homeWin || poisson.halfTime.homeWin;
    const poissonDraw = poisson.fullTime.draw || poisson.halfTime.draw;
    const poissonAway = poisson.fullTime.awayWin || poisson.halfTime.awayWin;
    
    // 转换为小数概率
    const pHome = poissonHome / 100;
    const pDraw = poissonDraw / 100;
    const pAway = poissonAway / 100;
    
    // 多样化的赔率分析开头
    const openingOptions = [
        `欧赔即时平均主胜 ${homeWinOdds}，平均平局 ${drawOdds}，平均客胜 ${awayWinOdds}，初步看好${recommendation === '主胜' ? teamNames.home : recommendation === '客胜' ? teamNames.away : '双方握手言和'}。`,
        `从平均欧赔数据来看，平均主胜赔 ${homeWinOdds}，平均平局赔 ${drawOdds}，平均客胜赔 ${awayWinOdds}，初步判断本场比赛更倾向于${recommendation === '主胜' ? `${teamNames.home}获胜` : recommendation === '客胜' ? `${teamNames.away}获胜` : '双方战平'}。`,
        `欧赔方面，当前平均主胜赔率为 ${homeWinOdds}，平均平局赔率 ${drawOdds}，平均客胜赔率 ${awayWinOdds}，综合来看，${recommendation === '主胜' ? teamNames.home : recommendation === '客胜' ? teamNames.away : '平局'}的可能性更高。`,
        `通过对平均欧赔的分析，平均主胜赔 ${homeWinOdds}，平均平局赔 ${drawOdds}，平均客胜赔 ${awayWinOdds}，我们可以初步得出${recommendation === '主胜' ? `${teamNames.home}有望取胜` : recommendation === '客胜' ? `${teamNames.away}更有可能获胜` : '比赛大概率平局收场'}的结论。`
    ];
    
    let analysis = openingOptions[Math.floor(Math.random() * openingOptions.length)];
    
    // 多样化的Margin分析
    if (oupeiMargin > 0) {
        const marginDescriptions = [
            ` 欧赔Margin为${oupeiMargin.toFixed(2)}%，${oupeiMargin < 8 ? '市场竞争激烈，赔率可信度较高' : oupeiMargin > 12 ? '市场利润较高，需谨慎参考' : '市场正常，赔率具有一定参考价值'}`,
            ` 目前欧赔的Margin值为${oupeiMargin.toFixed(2)}%，${oupeiMargin < 8 ? '这意味着市场竞争激烈，赔率数据相对可靠' : oupeiMargin > 12 ? '说明市场利润空间较大，投注时需谨慎考虑' : '处于正常范围，赔率信息具备参考意义'}`
        ];
        analysis += marginDescriptions[Math.floor(Math.random() * marginDescriptions.length)];
    }
    
    // 结合近期战绩
    if (recentRecords) {
        if (recentRecords.home.parsedStats) {
            const homeStreak = recentRecords.home.parsedStats.streak;
            if (homeStreak) {
                const homeStreakDescriptions = [
                    ` 主队${teamNames.home}近期${homeStreak.count}${homeStreak.type === 'win' ? '连胜' : '连败'}，${homeStreak.type === 'win' ? '状态火热，与主胜赔率形成呼应' : '状态低迷，需谨慎看待主胜赔率'}`,
                    ` 值得注意的是，${teamNames.home}最近${homeStreak.count}场比赛${homeStreak.type === 'win' ? '全部获胜' : '未尝胜绩'}，${homeStreak.type === 'win' ? '这样的出色状态与主胜赔率相互印证' : '这种低迷表现让主胜赔率的可信度打了折扣'}`
                ];
                analysis += homeStreakDescriptions[Math.floor(Math.random() * homeStreakDescriptions.length)];
            }
        }
        
        if (recentRecords.away.parsedStats) {
            const awayStreak = recentRecords.away.parsedStats.streak;
            if (awayStreak) {
                const awayStreakDescriptions = [
                    ` 客队${teamNames.away}近期${awayStreak.count}${awayStreak.type === 'win' ? '连胜' : '连败'}，${awayStreak.type === 'win' ? '状态出色，客胜赔率值得关注' : '状态不佳，客胜赔率可信度降低'}`,
                    ` 而${teamNames.away}近期${awayStreak.count}场比赛${awayStreak.type === 'win' ? '保持不败' : '连续失利'}，${awayStreak.type === 'win' ? '这让客胜赔率更具吸引力' : '这使得客胜赔率的参考价值有所下降'}`
                ];
                analysis += awayStreakDescriptions[Math.floor(Math.random() * awayStreakDescriptions.length)];
            }
        }
    }
    
    return analysis;
}

// 分析盘口变化与进攻火力
function analyzeHandicapAndAttack(odds, stats, teamNames) {
    const { yapan } = odds;
    const { xg } = stats;
    
    // 格式化亚盘显示，处理0值情况
    const currentHandicap = yapan.avgHandicap.current > 0 ? yapan.avgHandicap.current : '暂无数据';
    const initialHandicap = yapan.avgHandicap.initial > 0 ? yapan.avgHandicap.initial : currentHandicap;
    
    let analysis = '';
    if (currentHandicap !== '暂无数据' && initialHandicap !== '暂无数据') {
        const handicapChange = Math.abs(currentHandicap - initialHandicap).toFixed(1);
        const handicapChangeDescriptions = [
            `亚玩法即时平均玩法 ${currentHandicap}，较初值${currentHandicap > initialHandicap ? '升' : '降'}${handicapChange}，`,
            `从亚玩法走势来看，当前平均玩法为 ${currentHandicap}，与初值${initialHandicap}相比${currentHandicap > initialHandicap ? '上调' : '下调'}了${handicapChange}，`,
            `亚玩法方面，即时平均玩法为 ${currentHandicap}，较初始平均玩法${initialHandicap}${currentHandicap > initialHandicap ? '上升' : '下降'}了${handicapChange}，`
        ];
        analysis = handicapChangeDescriptions[Math.floor(Math.random() * handicapChangeDescriptions.length)];
    } else {
        analysis = `亚玩法数据缺失，`;
    }
    
    // 结合xG数据
    if (xg.home.fullTime > xg.away.fullTime) {
        const fullTimeXGDescriptions = [
            `${teamNames.home}全场xG ${xg.home.fullTime}高于${teamNames.away}的${xg.away.fullTime}，进攻火力更猛，`,
            `在进攻端，${teamNames.home}的全场xG值达到${xg.home.fullTime}，高于${teamNames.away}的${xg.away.fullTime}，显示出更强的进攻能力，`,
            `${teamNames.home}的全场预期进球数${xg.home.fullTime}明显高于${teamNames.away}的${xg.away.fullTime}，进攻火力更为强劲，`
        ];
        analysis += fullTimeXGDescriptions[Math.floor(Math.random() * fullTimeXGDescriptions.length)];
        
        // 增加半场xG分析
        if (xg.home.halfTime > xg.away.halfTime) {
            const halfTimeXGLeadingDescriptions = [
                `上半场xG ${xg.home.halfTime}也领先于${teamNames.away}的${xg.away.halfTime}，上下半场进攻表现稳定，`,
                `上半场${teamNames.home}的xG值${xg.home.halfTime}同样高于${teamNames.away}的${xg.away.halfTime}，进攻状态贯穿全场，`,
                `${teamNames.home}不仅全场xG占优，上半场的xG值${xg.home.halfTime}也领先于${teamNames.away}的${xg.away.halfTime}，进攻表现始终出色，`
            ];
            analysis += halfTimeXGLeadingDescriptions[Math.floor(Math.random() * halfTimeXGLeadingDescriptions.length)];
        } else {
            const halfTimeXGTurningDescriptions = [
                `不过上半场xG ${xg.home.halfTime}落后于${teamNames.away}的${xg.away.halfTime}，下半场进攻表现更加出色，`,
                `虽然上半场xG值${xg.home.halfTime}不及${teamNames.away}的${xg.away.halfTime}，但下半场${teamNames.home}的进攻火力明显提升，`,
                `值得注意的是，${teamNames.home}上半场xG值${xg.home.halfTime}低于${teamNames.away}的${xg.away.halfTime}，但下半场成功扭转了进攻局势，`
            ];
            analysis += halfTimeXGTurningDescriptions[Math.floor(Math.random() * halfTimeXGTurningDescriptions.length)];
        }
        
        const conclusionDescriptions = [
            `这与亚盘对${teamNames.home}的支持增强形成呼应。`,
            `这种进攻优势与亚盘走势相互印证，进一步支持${teamNames.home}的优势地位。`,
            `亚盘对${teamNames.home}的支持增强与球队的进攻表现相得益彰。`
        ];
        analysis += conclusionDescriptions[Math.floor(Math.random() * conclusionDescriptions.length)];
    } else {
        const fullTimeXGDescriptions = [
            `${teamNames.away}全场xG ${xg.away.fullTime}高于${teamNames.home}的${xg.home.fullTime}，进攻端表现更出色，`,
            `在进攻能力方面，${teamNames.away}的全场xG值${xg.away.fullTime}优于${teamNames.home}的${xg.home.fullTime}，显示出更强的进攻实力，`,
            `${teamNames.away}的全场预期进球数${xg.away.fullTime}高于${teamNames.home}的${xg.home.fullTime}，进攻表现更为出色，`
        ];
        analysis += fullTimeXGDescriptions[Math.floor(Math.random() * fullTimeXGDescriptions.length)];
        
        // 增加半场xG分析
        if (xg.away.halfTime > xg.home.halfTime) {
            const halfTimeXGLeadingDescriptions = [
                `上半场xG ${xg.away.halfTime}也领先于${teamNames.home}的${xg.home.halfTime}，上下半场进攻表现稳定，`,
                `上半场${teamNames.away}的xG值${xg.away.halfTime}同样高于${teamNames.home}的${xg.home.halfTime}，进攻状态始终保持出色，`,
                `${teamNames.away}不仅全场xG占优，上半场的xG值${xg.away.halfTime}也领先于${teamNames.home}的${xg.home.halfTime}，进攻表现持续强劲，`
            ];
            analysis += halfTimeXGLeadingDescriptions[Math.floor(Math.random() * halfTimeXGLeadingDescriptions.length)];
        } else {
            const halfTimeXGTurningDescriptions = [
                `不过上半场xG ${xg.away.halfTime}落后于${teamNames.home}的${xg.home.halfTime}，下半场进攻表现更加出色，`,
                `虽然上半场xG值${xg.away.halfTime}不及${teamNames.home}的${xg.home.halfTime}，但下半场${teamNames.away}的进攻火力明显增强，`,
                `${teamNames.away}在上半场xG值${xg.away.halfTime}低于${teamNames.home}的${xg.home.halfTime}，但下半场成功提升了进攻表现，`
            ];
            analysis += halfTimeXGTurningDescriptions[Math.floor(Math.random() * halfTimeXGTurningDescriptions.length)];
        }
        
        const conclusionDescriptions = [
            `这也解释了亚盘对${teamNames.away}的支持增强。`,
            `这种进攻优势与亚盘走势相吻合，进一步验证了${teamNames.away}的优势。`,
            `亚盘对${teamNames.away}的支持增强与球队的进攻表现相符。`
        ];
        analysis += conclusionDescriptions[Math.floor(Math.random() * conclusionDescriptions.length)];
    }
    
    return analysis;
}

// 分析大小球与进球预期
function analyzeOverUnderAndGoals(odds, stats) {
    const { daxiao } = odds;
    const { xg } = stats;
    
    // 格式化大小球显示，处理0值情况
    const currentLine = daxiao.avgLine.current > 0 ? daxiao.avgLine.current : '暂无数据';
    const initialLine = daxiao.avgLine.initial > 0 ? daxiao.avgLine.initial : currentLine;
    
    let analysis = '';
    if (currentLine !== '暂无数据' && initialLine !== '暂无数据') {
        const lineChange = Math.abs(currentLine - initialLine).toFixed(2);
        const lineChangeDescriptions = [
            `大小球即时平均玩法 ${currentLine}，较初值${currentLine > initialLine ? '升' : '降'}${lineChange}，`,
            `从大小球变化来看，当前平均玩法为 ${currentLine}，与初值${initialLine}相比${currentLine > initialLine ? '上升' : '下降'}了${lineChange}，`,
            `大小球方面，即时平均玩法是 ${currentLine}，较初始平均玩法${initialLine}${currentLine > initialLine ? '上调' : '下调'}了${lineChange}，`
        ];
        analysis = lineChangeDescriptions[Math.floor(Math.random() * lineChangeDescriptions.length)];
    } else {
        analysis = `大小球数据缺失，`;
    }
    
    // 结合xG数据和总进球预期
    const totalXg = xg.home.fullTime + xg.away.fullTime;
    const totalXGDescriptions = [
        `两队全场总xG ${totalXg.toFixed(2)}，进球预期${totalXg > 3.0 ? '较高' : '一般'}，`,
        `根据预期进球数据，两队全场总xG达到${totalXg.toFixed(2)}，进球机会${totalXg > 3.0 ? '较多' : '一般'}，`,
        `两队的全场预期进球总和为${totalXg.toFixed(2)}，${totalXg > 3.0 ? '进球预期较高' : '进球可能较为保守'}，`
    ];
    analysis += totalXGDescriptions[Math.floor(Math.random() * totalXGDescriptions.length)];
    
    // 结合赔率变化
    if (daxiao.avgCurrent.over > 0 && daxiao.avgCurrent.under > 0) {
        if (daxiao.avgCurrent.over < daxiao.avgCurrent.under) {
            const overBetDescriptions = [
                `大球赔率 ${daxiao.avgCurrent.over}低于小球赔率 ${daxiao.avgCurrent.under}，市场倾向大球`,
                `大球赔率 ${daxiao.avgCurrent.over}比小球赔率 ${daxiao.avgCurrent.under}更低，市场更看好大球打出`,
                `从赔率来看，大球赔 ${daxiao.avgCurrent.over}低于小球赔 ${daxiao.avgCurrent.under}，资金更倾向于大球方向`
            ];
            analysis += overBetDescriptions[Math.floor(Math.random() * overBetDescriptions.length)];
        } else {
            const underBetDescriptions = [
                `小球赔率 ${daxiao.avgCurrent.under}低于大球赔率 ${daxiao.avgCurrent.over}，市场倾向小球`,
                `小球赔率 ${daxiao.avgCurrent.under}比大球赔率 ${daxiao.avgCurrent.over}更低，市场更看好小球打出`,
                `从赔率分布来看，小球赔 ${daxiao.avgCurrent.under}低于大球赔 ${daxiao.avgCurrent.over}，资金更青睐小球方向`
            ];
            analysis += underBetDescriptions[Math.floor(Math.random() * underBetDescriptions.length)];
        }
    } else {
        analysis += `大小球赔率数据缺失`;
    }
    
    return analysis;
}

// 分析历史交锋与近期表现
function analyzeHistoryAndRecent(overview, teamNames, recommendation) {
    const { headToHead, recentRecords } = overview;
    
    let analysis = '';
    
    // 结合历史交锋
    if (headToHead && headToHead.parsedStats) {
        const { dominantTeam, wins, draws, losses, totalMatches } = headToHead.parsedStats;
        const historyDescriptions = [
            `历史交锋方面，${dominantTeam}在双方近${totalMatches}次交手中取得${wins}胜${draws}平${losses}负的优势，`,
            `回顾两队历史交锋，${dominantTeam}在最近${totalMatches}次对阵中以${wins}胜${draws}平${losses}负占据上风，`,
            `从历史战绩来看，${dominantTeam}与${dominantTeam === teamNames.home ? teamNames.away : teamNames.home}近${totalMatches}次交手取得${wins}胜${draws}平${losses}负，表现更为出色，`
        ];
        analysis += historyDescriptions[Math.floor(Math.random() * historyDescriptions.length)];
    }
    
    // 结合近期表现
    if (recentRecords) {
        if (recentRecords.home.parsedStats && recentRecords.away.parsedStats) {
            const homeWinRate = recentRecords.home.parsedStats.winRate;
            const awayWinRate = recentRecords.away.parsedStats.winRate;
            
            const recentFormDescriptions = [
                `近期表现来看，${teamNames.home}胜率${homeWinRate}%，${teamNames.away}胜率${awayWinRate}%，${homeWinRate > awayWinRate ? teamNames.home : teamNames.away}状态更佳，这与${recommendation === '主胜' ? '主胜' : recommendation === '客胜' ? '客胜' : '平局'}的推荐形成${homeWinRate > awayWinRate && recommendation === '主胜' || homeWinRate < awayWinRate && recommendation === '客胜' ? '印证' : '需要进一步验证'}`,
                `从近期状态分析，${teamNames.home}的胜率为${homeWinRate}%，${teamNames.away}的胜率为${awayWinRate}%，${homeWinRate > awayWinRate ? teamNames.home : teamNames.away}近期表现更为稳定，这与我们的${recommendation}推荐${homeWinRate > awayWinRate && recommendation === '主胜' || homeWinRate < awayWinRate && recommendation === '客胜' ? '相互支持' : '需要进一步观察'}`,
                `两队近期状态对比，${teamNames.home}胜率${homeWinRate}%，${teamNames.away}胜率${awayWinRate}%，${homeWinRate > awayWinRate ? teamNames.home : teamNames.away}状态更好，这与${recommendation}的推荐结果${homeWinRate > awayWinRate && recommendation === '主胜' || homeWinRate < awayWinRate && recommendation === '客胜' ? '一致' : '存在一定差异'}`
            ];
            analysis += recentFormDescriptions[Math.floor(Math.random() * recentFormDescriptions.length)];
        }
    }
    
    return analysis;
}

// 分析概率模型综合验证（加入赔率分析和Margin数据）
function analyzeProbabilityVerification(odds, stats, scores, teamNames, recommendation) {
    const { oupei } = odds;
    const { poisson } = stats;
    
    // 计算赔率隐含概率（考虑Margin）
    function calculateImpliedProbability(odds, margin) {
        return (1 / odds) * (1 - margin / 100);
    }
    
    // 获取欧赔数据
    const homeOdds = oupei.avgCurrent.home;
    const drawOdds = oupei.avgCurrent.draw;
    const awayOdds = oupei.avgCurrent.away;
    const currentMargin = oupei.avgCurrent.margin || 10.0; // 默认Margin为10%
    
    // 计算赔率隐含概率
    const oddsHome = homeOdds > 0 ? Math.round(calculateImpliedProbability(homeOdds, currentMargin) * 100) : 0;
    const oddsDraw = drawOdds > 0 ? Math.round(calculateImpliedProbability(drawOdds, currentMargin) * 100) : 0;
    const oddsAway = awayOdds > 0 ? Math.round(calculateImpliedProbability(awayOdds, currentMargin) * 100) : 0;
    
    // 获取泊松分布概率
    const poissonHome = poisson.fullTime.homeWin || poisson.halfTime.homeWin;
    const poissonDraw = poisson.fullTime.draw || poisson.halfTime.draw;
    const poissonAway = poisson.fullTime.awayWin || poisson.halfTime.awayWin;
    
    let analysis = `泊松分布显示全场主胜概率 ${poissonHome}%，平局 ${poissonDraw}%，客胜 ${poissonAway}%，`;
    
    // 添加赔率隐含概率分析
    if (oddsHome > 0 && oddsDraw > 0 && oddsAway > 0) {
        analysis += `赔率隐含概率主胜 ${oddsHome}%，平局 ${oddsDraw}%，客胜 ${oddsAway}%，`;
    }
    
    // 对比泊松分布和赔率隐含概率
    const homeDiff = Math.abs(poissonHome - oddsHome);
    const drawDiff = Math.abs(poissonDraw - oddsDraw);
    const awayDiff = Math.abs(poissonAway - oddsAway);
    
    // 结合综合评分
    if (recommendation === '主胜') {
        const isConsistent = Math.abs(poissonHome - scores.homeWin) < 10 && Math.abs(oddsHome - scores.homeWin) < 10;
        const hasBigDiff = Math.max(homeDiff, drawDiff, awayDiff) > 20;
        
        if (isConsistent) {
            analysis += `与综合评分主胜${scores.homeWin}%形成强印证，说明主胜结果的可信度较高`;
        } else if (hasBigDiff) {
            analysis += `与综合评分主胜${scores.homeWin}%形成弱印证，且泊松分布与赔率隐含概率存在较大差异（差值${Math.max(homeDiff, drawDiff, awayDiff)}%）。考虑到Margin为${currentMargin.toFixed(2)}%，建议以综合评分为准，推荐主胜`;
        } else {
            analysis += `与综合评分主胜${scores.homeWin}%形成弱印证，说明主胜结果的可信度一般`;
        }
    } else if (recommendation === '客胜') {
        const isConsistent = Math.abs(poissonAway - scores.awayWin) < 10 && Math.abs(oddsAway - scores.awayWin) < 10;
        const hasBigDiff = Math.max(homeDiff, drawDiff, awayDiff) > 20;
        
        if (isConsistent) {
            analysis += `与综合评分客胜${scores.awayWin}%形成强印证，说明客胜结果的可信度较高`;
        } else if (hasBigDiff) {
            analysis += `与综合评分客胜${scores.awayWin}%形成弱印证，且泊松分布与赔率隐含概率存在较大差异（差值${Math.max(homeDiff, drawDiff, awayDiff)}%）。考虑到Margin为${currentMargin.toFixed(2)}%，建议以综合评分为准，推荐客胜`;
        } else {
            analysis += `与综合评分客胜${scores.awayWin}%形成弱印证，说明客胜结果的可信度一般`;
        }
    } else {
        const isConsistent = Math.abs(poissonDraw - scores.draw) < 10 && Math.abs(oddsDraw - scores.draw) < 10;
        const hasBigDiff = Math.max(homeDiff, drawDiff, awayDiff) > 20;
        
        if (isConsistent) {
            analysis += `与综合评分平局${scores.draw}%形成强印证，说明平局结果的可信度较高`;
        } else if (hasBigDiff) {
            analysis += `与综合评分平局${scores.draw}%形成弱印证，且泊松分布与赔率隐含概率存在较大差异（差值${Math.max(homeDiff, drawDiff, awayDiff)}%）。考虑到Margin为${currentMargin.toFixed(2)}%，建议以综合评分为准，推荐平局`;
        } else {
            analysis += `与综合评分平局${scores.draw}%形成弱印证，说明平局结果的可信度一般`;
        }
    }
    
    return analysis;
}