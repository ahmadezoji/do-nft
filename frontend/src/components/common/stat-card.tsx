import { Card } from "./card";

export const StatCard = ({ label, value }: { label: string; value: number }) => (
  <Card className="stat-card">
    <span className="eyebrow">{label}</span>
    <strong>{value}</strong>
  </Card>
);
