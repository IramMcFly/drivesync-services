'use client';

import { useServiceStatus } from '../../../hooks/useServiceStatus';
import ClienteServiceStatus from './ClienteServiceStatus';

export default function ServiceStatusWrapper() {
  const { activeService, showServiceStatus, setShowServiceStatus } = useServiceStatus();

  if (!showServiceStatus || !activeService) {
    return null;
  }

  return (
    <ClienteServiceStatus
      serviceRequest={activeService}
      onClose={() => setShowServiceStatus(false)}
    />
  );
}
