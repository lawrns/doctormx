# Estrategia de Respaldo y Recuperación - Doctor.mx

> **Última actualización:** 2026-02-10
> **Contexto:** México | Región Principal: Supabase US-East
> **Objetivos:** RPO < 1 hora | RTO < 4 horas

---

## Visión General

Doctor.mx implementa una estrategia de respaldo multicapa que combina automatización nativa de Supabase con procesos manuales adicionales para garantizar la integridad de datos clínicos y cumplimiento con normativas mexicanas.

---

## 1. Clasificación de Datos

### Datos Críticos (Nivel 1)
- Expedientes clínicos (`consultations`, `soap_notes`)
- Citas confirmadas (`appointments`)
- Información de pacientes (`profiles`)
- Firmas digitales (`digital_signatures`)

### Datos Importantes (Nivel 2)
- Historial de transacciones (`subscriptions`, `payments`)
- Auditorías de seguridad (`security_events`)
- Configuraciones de doctores (`doctors`)

### Datos Recuperables (Nivel 3)
- Métricas de analytics (`ai_match_analytics`)
- Logs de aplicación
- Cachés temporales

---

## 2. Estrategia de Respaldos Automatizados

### 2.1 Backups Diarios (Supabase)

**Programación:**
- **Frecuencia:** Diaria (automático)
- **Horario:** 3:00 AM CST (baja demanda)
- **Retención:** 30 días
- **Método:** Supabase Managed Backups

**Componentes Respaldados:**
```yaml
Base de datos:
  - Todas las tablas PostgreSQL
  - Funciones y triggers
  - Políticas RLS
  - Índices

Almacenamiento:
  - Archivos de Storage (documentos clínicos)
  - Firmas digitales
  - Evidencias de consultas

Configuración:
  - Edge Functions
  - Variables de entorno
  - Configuración de autenticación
```

**Verificación:**
- Monitoreo vía Slack webhook
- Alertas por correo electrónico
- Dashboard de Supabase revisado diariamente

### 2.2 Backups Semanales (Manual)

**Programación:**
- **Frecuencia:** Semanal (domingos)
- **Horario:** 4:00 AM CST
- **Responsable:** DevOps Engineer
- **Retención:** 90 días

**Proceso:**
```bash
# 1. Exportar dump completo de la base de datos
pg_dump -Fc -h db.xxx.supabase.co -U postgres \
  -d postgres > doctor_mx_weekly_$(date +%Y%m%d).dump

# 2. Subir a almacenamiento seguro (AWS S3 Glacier)
aws s3 cp doctor_mx_weekly_*.dump \
  s3://doctor-mx-backups/glacier/ \
  --storage-class GLACIER

# 3. Generar hash de verificación
sha256sum doctor_mx_weekly_*.dump > checksums.txt

# 4. Registrar en log de auditoría
echo "$(date): Weekly backup completed" >> backup.log
```

### 2.3 Backups Incrementales (Cada Hora)

**Programación:**
- **Frecuencia:** Cada hora
- **Retención:** 7 días
- **Método:** Supabase Point-in-Time Recovery (PITR)

**Datos Capturados:**
```sql
-- Tablas críticas con cambios frecuentes
SELECT * FROM consultations
WHERE updated_at > NOW() - INTERVAL '1 hour';

SELECT * FROM appointments
WHERE created_at > NOW() - INTERVAL '1 hour';

SELECT * FROM security_events
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## 3. Verificación Semanal (Restore Tests)

### 3.1 Prueba de Restauración

**Programación:**
- **Frecuencia:** Semanal (lunes)
- **Horario:** 5:00 AM CST
- **Duración estimada:** 30 minutos
- **Responsable:** Backend Engineer

**Procedimiento:**
```bash
# 1. Crear base de datos de prueba
psql -h localhost -U postgres \
  -c "CREATE DATABASE doctor_mx_restore_test;"

# 2. Restaurar backup más reciente
pg_restore -h localhost -U postgres \
  -d doctor_mx_restore_test \
  --no-owner --no-acl \
  doctor_mx_daily_$(date +%Y%m%d).dump

# 3. Verificar integridad de datos
psql -h localhost -U postgres -d doctor_mx_restore_test << EOF
-- Verificar registros críticos
SELECT COUNT(*) FROM consultations; -- Debe ser > 0
SELECT COUNT(*) FROM appointments WHERE status = 'confirmed';
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM digital_signatures;

-- Verificar restricciones
SELECT COUNT(*) FROM consultations WHERE patient_id IS NULL; -- Debe ser 0

-- Verificar integridad referencial
SELECT COUNT(*) FROM appointments a
LEFT JOIN profiles p ON a.patient_id = p.id
WHERE p.id IS NULL; -- Debe ser 0
EOF

# 4. Documentar resultados
echo "$(date): Restore test completed successfully" >> restore_tests.log

# 5. Limpiar base de datos
psql -h localhost -U postgres \
  -c "DROP DATABASE doctor_mx_restore_test;"
```

### 3.2 Checklist de Verificación

- [ ] Base de datos restaurada sin errores
- [ ] Todos los registros están presentes
- [ ] Restricciones y triggers funcionando
- [ ] Políticas RLS activas
- [ ] Firmas digitales accesibles
- [ ] Archivos de Storage disponibles
- [ ] Logs de auditoría intactos
- [ ] Tiempo de restauración documentado

---

## 4. Multi-Region Replication

### 4.1 Estrategia Actual

**Región Primaria:** US-East (Norte Virginia)
- Todas las operaciones de producción
- Latencia promedio desde CDMX: 45ms
- Soporte 24/7

**Replicación:**
- **Asíncrona:** 15 minutos RPO
- **Tabla de replicación:** Toda la base de datos
- **Failover automático:** No disponible (Pro plan)
- **Failover manual:** Documentado en sección 5

### 4.2 Planeación Futura

**Fase 2 (Q3 2026):**
- Configurar réplica en US-West (Oregón)
- Implementar DNS global
- Automatizar failover

**Fase 3 (Q4 2026):**
- Evaluar réplica en región São Paulo (Brasil)
- Reducir latencia para México
- Cumplimiento de datos locales

---

## 5. Métricas RPO/RTO

### 5.1 Definiciones

**RPO (Recovery Point Objective):**
- Tiempo máximo de datos perdidos aceptables
- **Objetivo actual:** < 1 hora
- **Razón:** Pérdida de consultas médicas es crítica

**RTO (Recovery Time Objective):**
- Tiempo máximo para restaurar servicios
- **Objetivo actual:** < 4 horas
- **Razón:** Pacientes necesitan acceso oportuno

### 5.2 Métricas por Componente

| Componente | RPO | RTO | Prioridad |
|------------|-----|-----|-----------|
| Base de datos principal | 1 hora | 2 horas | Crítica |
| Storage (archivos) | 24 horas | 4 horas | Alta |
| Edge Functions | 0 | 1 hora | Media |
| Analytics | 7 días | 48 horas | Baja |

---

## 6. Procedimiento de Restauración

### 6.1 Escenario: Corrupción de Datos

**Pasos:**
1. **Identificar punto de restauración**
   ```bash
   # Listar backups disponibles
   ls -lh doctor_mx_daily_*.dump | sort -k9
   ```

2. **Detener aplicación**
   ```bash
   # Vercel
   vercel deploy --prebuilt --no-wait
   # O desconectar dominio en dashboard
   ```

3. **Restaurar backup**
   ```bash
   # Via Supabase Dashboard
   # Settings > Database > Restore from backup

   # O vía CLI
   supabase db restore \
     --project-ref xxx \
     --backup-id 20260210_030000
   ```

4. **Verificar integridad**
   ```sql
   -- Ejecutar queries de verificación
   SELECT COUNT(*) FROM consultations;
   SELECT MAX(created_at) FROM appointments;
   ```

5. **Reiniciar aplicación**
   ```bash
   vercel deploy --prod
   ```

6. **Monitorear**
   - Revisar logs de aplicación
   - Verificar métricas de error
   - Confirmar operaciones normales

### 6.2 Escenario: Pérdida Total de Región

**Pasos:**
1. **Activar región secundaria**
   ```bash
   # Actualizar DNS a réplica
   supabase projects update \
     --failover-region us-west-1
   ```

2. **Promocionar réplica**
   - Via Dashboard: Database > Replication > Promote

3. **Actualizar variables de entorno**
   ```bash
   # En Vercel
   NEXT_PUBLIC_SUPABASE_URL=<nueva_url>
   ```

4. **Verificar operaciones críticas**
   - Pacientes pueden acceder
   - Doctores pueden consultar
   - Citas se crean correctamente

---

## 7. Almacenamiento de Respaldos

### 7.1 Ubicaciones

**Primaria:** Supabase Managed Backups
- Cifrado AES-256
- Retención 30 días
- Acceso vía dashboard/API

**Secundaria:** AWS S3 Glacier
- Región: us-east-1
- Cifrado: SSE-KMS
- Retención: 7 años (compliance)

**Terciaria:** Local (Desarrollo)
- Solo para pruebas
- No contiene datos reales de pacientes
- Eliminado después de restore test

### 7.2 Control de Acceso

**AWS S3:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::xxx:role/backup-admin"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::doctor-mx-backups/*"
    }
  ]
}
```

---

## 8. Monitoreo y Alertas

### 8.1 Métricas Monitoreadas

- **Estado de backups:** Exitosos/Fallidos
- **Tiempo de retención:** Días disponibles
- **Tamaño de backups:** Crecimiento anormal
- **Tiempo de restauración:** Cumplimiento RTO

### 8.2 Configuración de Alertas

```yaml
# Slack Integration
Alertas:
  - Backup fallido: #emergency
  - Restore test fallido: #ops-critical
  - RPO excedido: #ops-warning
  - Almacenamiento > 80%: #ops-info
```

### 8.3 Dashboard de Monitoreo

**Supabase Dashboard:**
- Database > Backups > History
- Logs > Database Logs

**AWS CloudWatch:**
- S3 Storage Metrics
- Glacier Retrieval Metrics

---

## 9. Procedimientos de Emergencia

### 9.1 Contactos

| Rol | Nombre | Teléfono | Email |
|-----|--------|----------|-------|
| DevOps Lead | Carlos Rodríguez | +52 55 1234 5678 | carlos@doctory.mx |
| Backend Lead | Ana Martínez | +52 55 8765 4321 | ana@doctory.mx |
| CTO | Miguel García | +52 55 1111 2222 | miguel@doctory.mx |

### 9.2 Escenarios de Emergencia

**Backup Fallido:**
1. Verificar logs de Supabase
2. Reintentar backup manual
3. Notificar al equipo en #ops-critical
4. Documentar incidente

**Restore Test Fallido:**
1. Identificar error en logs
2. Verificar integridad del archivo
3. Intentar con backup anterior
4. Escalar a CTO si persiste

**Almacenamiento Lleno:**
1. Eliminar backups antiguos (> 90 días)
2. Verificar crecimiento anormal
3. Considerar upgrade de plan
4. Documentar capacidad

---

## 10. Cumplimiento Normativo

### 10.1 Normas Mexicanas

**Ley Federal de Protección de Datos Personales en Posesión de los Particulares:**
- Datos personales: Respaldos cifrados
- Consentimiento: Auditoría de acceso
- Derechos ARCO: Procesamiento en 48 horas

**NOM-024-SSA1-2012 (Expedientes clínicos):**
- Conservación: 5 años (adultos), 7 años (menores)
- Confidencialidad: Acceso restringido
- Integridad: Verificación semanal

**Cofepris:**
- Notificación de incidentes: 48 horas
- Registro de procesamiento: Actualizado
- Transferencias internacionales: Documentadas

### 10.2 Auditorías

**Trimestral:**
- Verificación de retención
- Prueba de acceso a backups
- Revisión de logs de seguridad

**Anual:**
- Auditoría externa de cumplimiento
- Pen-testing de restore
- Revisión de SLAs con proveedores

---

## 11. Mejoras Continuas

### 11.1 Roadmap

**Q2 2026:**
- [ ] Automatizar restore tests con GitHub Actions
- [ ] Implementar backups cross-cloud (GCP + AWS)
- [ ] Reducir RPO a 15 minutos con WAL archiving

**Q3 2026:**
- [ ] Multi-region activa-passiva
- [ ] Failover automatizado
- [ ] Dashboard unificado de backups

**Q4 2026:**
- [ ] Réplicas en tiempo real
- [ ] Backups incrementales cada 5 minutos
- [ ] AI para predicción de fallas

### 11.2 Métricas de Éxito

- **Disponibilidad:** > 99.9% (43.8 minutos/mes downtime)
- **Pérdida de datos:** < 1 consulta por incidente
- **Tiempo de restauración:** < 4 horas promedio
- **Backups exitosos:** > 99.5%

---

## 12. Documentación Relacionada

- [BUSINESS_CONTINUITY.md](./BUSINESS_CONTINUITY.md) - Plan de continuidad operativa
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - Respuesta a incidentes
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [CREDENTIALS.md](./CREDENTIALS.md) - Accesos de emergencia

---

## 13. Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-02-10 | Versión inicial - FLOW-1.2 | Claude Opus |
| - | - | - |

---

**Este documento debe ser revisado trimestralmente o después de cualquier incidente mayor.**
