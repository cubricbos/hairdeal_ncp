import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, Scissors, Camera, Download, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../supabase';

type PortfolioItem = {
  created_at: string;
  tags: string[];
};

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    thisMonthCount: 0,
    totalCount: 0,
    topStyle: '-',
    savedCostDisplay: '0원'
  });
  
  const [chartData, setChartData] = useState<{name: string, count: number}[]>([]);
  const [topStyles, setTopStyles] = useState<{style: string, count: number, percentage: number, color: string}[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        
        // Fetch all generated portfolios for this user
        const { data, error } = await supabase
          .from('ai_portfolios')
          .select('created_at, tags')
          .eq('user_id', session.user.id);
          
        if (error || !data) throw error;
        
        processMetrics(data);
      } catch (err) {
        console.error('Error fetching reports data: ', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const processMetrics = (data: PortfolioItem[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let thisMonthCount = 0;
    let totalCount = data.length;
    
    // Day of week distribution array (Mon to Sun)
    // 0 is Sunday in JS, so we'll map 1->Mon(0), 2->Tue(1) ... 0->Sun(6)
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    // Style frequencies
    const styleFreq: Record<string, number> = {};
    
    data.forEach(item => {
      const date = new Date(item.created_at);
      
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        thisMonthCount++;
      }
      
      const day = date.getDay(); // 0 is Sun, 1 is Mon
      const mappedDay = day === 0 ? 6 : day - 1; // Map to 0-based Mon-Sun
      dayCounts[mappedDay]++;
      
      const firstTag = item.tags && item.tags.length > 0 ? item.tags[0] : null;
      if (firstTag) {
        // First tag is usually the primary hairstyle chosen
        styleFreq[firstTag] = (styleFreq[firstTag] || 0) + 1;
      }
    });
    
    // Process top styles
    const sortedStyles = Object.entries(styleFreq)
      .sort((a, b) => b[1] - a[1]);
      
    const topStyleName = sortedStyles.length > 0 ? sortedStyles[0][0] : '-';
    
    // Select colors for top 5
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500'];
    
    let totalStyleCount = data.filter(d => d.tags && d.tags.length > 0).length;
    if (totalStyleCount === 0) totalStyleCount = 1; // Prevent div by 0
    
    const formattedTopStyles = sortedStyles.slice(0, 5).map((item, idx) => ({
      style: item[0],
      count: item[1],
      percentage: Math.round((item[1] / totalStyleCount) * 100),
      color: colors[idx % colors.length]
    }));
    
    const savedCost = totalCount * 30000; // Assume 1 AI photo saves 30,000 KRW
    const savedCostStr = savedCost >= 10000 ? `${(savedCost / 10000).toLocaleString()}만원` : `${savedCost.toLocaleString()}원`;

    setStats({
      thisMonthCount,
      totalCount,
      topStyle: topStyleName,
      savedCostDisplay: savedCostStr
    });
    
    setChartData([
      { name: '월', count: dayCounts[0] },
      { name: '화', count: dayCounts[1] },
      { name: '수', count: dayCounts[2] },
      { name: '목', count: dayCounts[3] },
      { name: '금', count: dayCounts[4] },
      { name: '토', count: dayCounts[5] },
      { name: '일', count: dayCounts[6] },
    ]);
    
    setTopStyles(formattedTopStyles);
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
        </div>
     );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">생성 보고서</h1>
          <p className="text-gray-500 font-medium">AI 헤어모델 생성 및 활용 통계를 확인하세요</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
          <Download className="w-5 h-5 text-gray-400" /> 리포트 다운로드
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: '이번 달 생성수', value: `${stats.thisMonthCount}건`, icon: Camera, color: 'bg-blue-500', trend: '이번 달' },
          { label: '총 누적 생성수', value: `${stats.totalCount}건`, icon: Users, color: 'bg-purple-500', trend: '전체' },
          { label: '가장 많이 쓴 헤어', value: stats.topStyle, icon: Scissors, color: 'bg-pink-500', trend: '인기' },
          { label: '절감한 촬영 비용', value: stats.savedCostDisplay, icon: TrendingUp, color: 'bg-emerald-500', trend: '예상치' }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.color} text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">{stat.trend}</span>
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1 */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-primary" /> 요일별 생성 트렌드
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontWeight: 600, fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Styles */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">인기 헤어 스타일 TOP 5</h3>
          <div className="space-y-6">
            {topStyles.length > 0 ? topStyles.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-gray-700">{item.style}</span>
                  <span className="text-gray-900">{item.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className={`h-full ${item.color}`}
                  />
                </div>
              </div>
            )) : (
               <div className="py-12 flex items-center justify-center text-gray-400 font-medium text-sm">
                 아직 생성된 스타일 데이터가 없습니다.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
