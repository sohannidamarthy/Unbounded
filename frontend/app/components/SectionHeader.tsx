type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export default function SectionHeader({
  title,
  description,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`section-head ${className}`}>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}