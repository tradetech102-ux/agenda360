// Ícones SVG minimalistas e profissionais para eventos do calendário

export const TaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const MeetingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 6.5C4 8 4 9 4 10M12 6.5C12 8 12 9 12 10M8 6.5C8 8 8 9 8 10M4 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const SaleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6L8 2L14 6V13C14 13.5304 13.7893 14.0391 13.4142 14.4142C13.0391 14.7893 12.5304 15 12 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 2V5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const PaymentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 7H14" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const VisitIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8L8 3L13 8V12C13 12.5304 12.7893 13.0391 12.4142 13.4142C12.0391 13.7893 11.5304 14 11 14H5C4.46957 14 3.96086 13.7893 3.58579 13.4142C3.21071 13.0391 3 12.5304 3 12V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 14V10H10V14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// Componente que retorna o ícone correto baseado no tipo
export const EventIcon = ({ type, color = "#a0a0a0" }: { type: string; color?: string }) => {
  const iconProps = { style: { color } };

  switch (type) {
    case "task":
      return <TaskIcon />;
    case "meeting":
      return <MeetingIcon />;
    case "sale":
      return <SaleIcon />;
    case "payment":
      return <PaymentIcon />;
    case "visit":
      return <VisitIcon />;
    default:
      return <TaskIcon />;
  }
};
