interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-secondary-200">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
          {title}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-2">
          {description}
        </p>
      </div>
      {children && (
        <div className="flex items-center space-x-3">{children}</div>
      )}
    </div>
  );
}
