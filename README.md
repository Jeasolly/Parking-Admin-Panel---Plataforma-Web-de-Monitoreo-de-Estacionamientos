# ParkAdmin Web - Panel Administrativo para Estacionamientos

ParkAdmin Web es una plataforma administrativa desarrollada con React, Prisma y PostgreSQL, diseñada para centralizar y visualizar información operativa y contable de estacionamientos conectados a servidores locales on-premise.

El proyecto nace como solución para clientes que cuentan con sistemas de parking instalados localmente, pero que no tienen acceso directo a la información desde internet. En muchos casos, el área contable o administrativa necesita consultar cobros diarios, recaudación por operador, comprobantes electrónicos emitidos y movimientos del estacionamiento sin depender físicamente de la caseta o del servidor local.

A través de este panel web, la información de diferentes estacionamientos puede ser expuesta de forma segura y ordenada mediante APIs, permitiendo que los clientes accedan visualmente a los datos más importantes de sus operaciones en tiempo real.

## Objetivo del proyecto

El objetivo principal de ParkAdmin Web es brindar una herramienta moderna, centralizada y accesible para la supervisión de estacionamientos, conectando servidores de parking on-premise con una plataforma web administrativa.

De esta manera, los clientes pueden revisar información clave del negocio desde cualquier lugar, sin necesidad de ingresar directamente al servidor local del estacionamiento.

## Problema que resuelve

Muchos sistemas de estacionamiento trabajan de forma local dentro de cada sede, lo que limita el acceso remoto a la información operativa y contable.

Esto genera dificultades para:

- Revisar la recaudación diaria.
- Consultar los cobros realizados por operador.
- Verificar comprobantes electrónicos emitidos.
- Supervisar varias sedes desde un solo lugar.
- Acceder a reportes sin depender del personal de caseta.
- Centralizar información de estacionamientos independientes.

ParkAdmin Web permite solucionar este problema mediante un panel administrativo conectado por APIs a los servidores locales de parking.

## Características principales

- Panel administrativo web moderno y responsive.
- Consulta de información en tiempo real desde servidores de estacionamiento.
- Integración mediante APIs con sistemas de parking on-premise.
- Visualización de cobros diarios.
- Consulta de recaudación por operador o caja.
- Revisión de comprobantes electrónicos emitidos.
- Control visual de información operativa por estacionamiento.
- Soporte para múltiples sedes o clientes.
- Arquitectura preparada para crecimiento y nuevas integraciones.
- Base de datos centralizada con PostgreSQL.
- Gestión de datos mediante Prisma ORM.
- Interfaz clara, profesional y fácil de usar.

## Casos de uso

Este sistema está pensado para empresas, administradores y áreas contables que necesitan consultar información del estacionamiento sin acceder directamente al servidor local.

Algunos casos de uso son:

- El área contable puede revisar los cobros del día.
- El cliente puede consultar los CPE emitidos.
- El administrador puede supervisar varias playas de estacionamiento.
- La empresa puede centralizar información de diferentes sedes.
- Los operadores pueden mantener el sistema local, mientras la gerencia revisa datos desde la web.

## Arquitectura general

El sistema está diseñado para trabajar con estacionamientos que operan con servidores locales. Estos servidores no siempre están expuestos directamente a internet, por lo que el panel web se conecta mediante APIs o servicios intermedios que permiten obtener la información necesaria de forma controlada.

Flujo general:

```text
Servidor local de parking
        ↓
API / Servicio de conexión
        ↓
Backend del panel administrativo
        ↓
Base de datos PostgreSQL
        ↓
Panel Web React
        ↓
Cliente / Área contable / Administrador
