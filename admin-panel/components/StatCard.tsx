type StatCardProps = {
    title: string;
    value: string;
    description: string;
  };
  
  export default function StatCard({
    title,
    value,
    description,
  }: StatCardProps) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <p className="text-sm text-slate-500">{title}</p>
  
        <h2 className="text-3xl font-bold text-slate-900 mt-2">
          {value}
        </h2>
  
        <p className="text-sm text-slate-500 mt-2">
          {description}
        </p>
      </div>
    );
  }