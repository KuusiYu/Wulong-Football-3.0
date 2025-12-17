// 计算统计数据的函数
function calculateStats(values) {
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
}

// 处理单个赔率表格
function processOddsTable(table) {
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
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
        stats.push(calculateStats(values));
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
    
    tbody.appendChild(statsRow);
}

// 查找并处理所有赔率表格（包括欧赔、亚盘、大小球） - 已注释以隐藏统计行
// document.querySelectorAll('.odds-section .odds-table').forEach(table => {
//     processOddsTable(table);
// });

// console.log('赔率统计数据已添加完成！');