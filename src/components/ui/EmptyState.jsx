import React from 'react';
import Icon from './Icon';
import Button from './Button';

const EmptyState = ({
  icon = 'document',
  title,
  description,
  action,
  actionText,
  onAction,
  className = '',
  ...props
}) => {
  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon name={icon} size="2xl" color="gray" />
      </div>
      
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText || action}
        </Button>
      )}
    </div>
  );
};

// Predefined empty states for common scenarios
export const NoDataEmptyState = ({ onRefresh, ...props }) => (
  <EmptyState
    icon="document"
    title="No hay datos"
    description="No se encontraron elementos para mostrar en este momento."
    action="Recargar"
    onAction={onRefresh}
    {...props}
  />
);

export const NoResultsEmptyState = ({ onClearFilters, ...props }) => (
  <EmptyState
    icon="magnifying-glass"
    title="Sin resultados"
    description="No se encontraron resultados que coincidan con tu búsqueda."
    action="Limpiar filtros"
    onAction={onClearFilters}
    {...props}
  />
);

export const ErrorEmptyState = ({ onRetry, ...props }) => (
  <EmptyState
    icon="exclamation-triangle"
    title="Error al cargar"
    description="Ocurrió un error al cargar los datos. Por favor, inténtalo de nuevo."
    action="Reintentar"
    onAction={onRetry}
    {...props}
  />
);

export const NoPermissionsEmptyState = ({ ...props }) => (
  <EmptyState
    icon="lock-closed"
    title="Sin permisos"
    description="No tienes permisos para ver este contenido."
    {...props}
  />
);

export const NoNotificationsEmptyState = ({ ...props }) => (
  <EmptyState
    icon="bell"
    title="Sin notificaciones"
    description="No tienes notificaciones pendientes."
    {...props}
  />
);

export const NoPatientsEmptyState = ({ onAddPatient, ...props }) => (
  <EmptyState
    icon="user-group"
    title="Sin pacientes"
    description="Aún no tienes pacientes asignados. Los pacientes aparecerán aquí cuando sean referidos por IA."
    action="Ver doctores"
    onAction={onAddPatient}
    {...props}
  />
);

export const NoConsultationsEmptyState = ({ onStartConsultation, ...props }) => (
  <EmptyState
    icon="chat-bubble-left-right"
    title="Sin consultas"
    description="Aún no tienes consultas. Las consultas aparecerán aquí cuando los pacientes inicien sesiones."
    action="Iniciar consulta"
    onAction={onStartConsultation}
    {...props}
  />
);

export default EmptyState;

