import { audienciaService } from './api/audienciaService';

/**
 * Función para obtener las aplicaciones
 * @returns {Promise<Array>} Lista de aplicaciones
 */
const obtenerAplicaciones = async () => {
  try {
    return await audienciaService.obtenerAplicaciones();
  } catch (error) {
    console.error("Error al obtener aplicaciones:", error);
    return { data: [] };
  }
};

/**
 * Función para obtener datos de audiencia
 * @returns {Promise<Object>} Respuesta del servicio
 */
const obtenerDatosAudiencia = async () => {
  try {
    return await audienciaService.obtenerAudiencia();
  } catch (error) {
    console.error("Error al obtener audiencia:", error);
    return { data: [] };
  }
};

/**
 * Función para procesar los datos de audiencia, obteniendo aplicaciones, clientes y usuarios
 * desde el servicio
 * @returns {Object} Datos procesados
 */
export const procesarDatosAudiencia = async () => {
  try {
    // Obtenemos los datos de audiencia
    const response = await obtenerDatosAudiencia();
    
    // Obtenemos las aplicaciones del servicio
    const appsResponse = await obtenerAplicaciones();
    
    // Validación de los datos de audiencia
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error('Formato de datos inválido:', response);
      return { 
        applications: [], 
        clients: [], 
        users: [], 
        clientUserRelations: {} 
      };
    }
    
    // Validación de los datos de aplicaciones
    if (!appsResponse || !appsResponse.data || !Array.isArray(appsResponse.data)) {
      console.error('Formato de datos de aplicaciones inválido:', appsResponse);
      return { 
        applications: [], 
        clients: [], 
        users: [], 
        clientUserRelations: {} 
      };
    }
    
    const datos = response.data;
    
    // Procesar aplicaciones desde la base de datos con validación para evitar errores
    const applications = appsResponse.data.map(app => ({
      id: app.idApp ? app.idApp.toString() : '',
      name: app.name || 'Sin nombre' // Valor predeterminado si Name no existe
    }));
    
    // Procesar clientes (compañías) con validación
    const clients = datos.reduce((acc, item) => {
      if (item.idCompany && !acc.some(company => company.id === item.idCompany.toString())) {
        acc.push({
          id: item.idCompany.toString(),
          name: item.name || 'Cliente sin nombre',
          IdUserCompany: item.idUserCompany.toString()
        });
      }
      return acc;
    }, []);
    
    // Procesar usuarios con validación
    const users = datos.reduce((acc, item) => {
      if (item.idUser && !acc.some(user => user.id === item.idUser.toString())) {
        acc.push({
          id: item.idUser.toString(),
          name: item.fullName || 'Usuario sin nombre',
          email: item.email || ''
        });
      }
      return acc;
    }, []);
    
    // Crear mapa de relaciones entre clientes y usuarios
    const clientUserRelations = {};
    
    // Inicializar la estructura de relaciones
    clients.forEach(client => {
      if (client.id) {
        clientUserRelations[client.id] = [];
      }
    });
    
    // Llenar las relaciones con validación
    datos.forEach(item => {
      if (item.idCompany && item.idUser) {
        const clientId = item.idCompany.toString();
        const userId = item.idUser.toString();
        
        if (clientUserRelations[clientId] && !clientUserRelations[clientId].includes(userId)) {
          clientUserRelations[clientId].push(userId);
        }
      }
    });
    
    return {
      applications,     // Aplicaciones obtenidas de la BD
      clients,          // Clientes procesados del servicio
      users,            // Usuarios procesados del servicio
      clientUserRelations // Relaciones cliente-usuario
    };
  } catch (error) {
    console.error('Error al procesar datos de audiencia:', error);
    return { 
      applications: [], 
      clients: [], 
      users: [], 
      clientUserRelations: {} 
    };
  }
};

/**
 * Obtiene las aplicaciones de la base de datos
 * @returns {Promise<Array>} Lista de aplicaciones
 */
export const getApplications = async () => {
  try {
    const { applications } = await procesarDatosAudiencia();
    console.log('Aplicaciones:', applications);
    return applications; // Eliminado el delay artificial
  } catch (error) {
    console.error('Error al obtener aplicaciones:', error);
    return [];
  }
};

/**
 * Obtiene los clientes procesados del servicio
 * @returns {Promise<Array>} Lista de clientes
 */
export const getClients = async () => {
  try {
    const { clients } = await procesarDatosAudiencia();
    return clients; // Eliminado el delay artificial
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return [];
  }
};

/**
 * Obtiene los usuarios procesados del servicio
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getUsers = async () => {
  try {
    const { users } = await procesarDatosAudiencia();
    return users; // Eliminado el delay artificial
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

/**
 * Obtiene la audiencia completa asignada a una noticia
 * @param {string|number} newsId - ID de la noticia
 * @returns {Promise<Object>} Datos de audiencia
 */
export const getAssignedAudience = async (newsId) => {
  try {
    // Llamamos a ambos endpoints para obtener los datos completos
    const appsResponse = await audienciaService.obtenerAudienciaApps({ idNew: newsId.toString() });
    const launcherResponse = await audienciaService.obtenerAudienciaLauncher({ idNew: newsId.toString() });
    
    // Verificar si las respuestas son válidas
    if (!appsResponse || appsResponse.statusCode !== "200") {
      console.warn('Respuesta inválida de obtenerAudienciaApps:', appsResponse);
    }
    
    if (!launcherResponse || launcherResponse.statusCode !== "200") {
      console.warn('Respuesta inválida de obtenerAudienciaLauncher:', launcherResponse);
    }
    
    // Combinar los datos de ambas respuestas
    const appsData = appsResponse?.data || [];
    const launcherData = launcherResponse?.data || [];
    const combinedData = [...appsData, ...launcherData];
    
    // Agrupar datos por tipo (app, cliente, usuario)
    const apps = new Map();
    const clients = new Map();
    const users = new Map();
    
    // Procesar los datos combinados
    combinedData.forEach(item => {
      if (!item) return;
      
      // Procesar aplicación
      if (item.appName) {
        apps.set(item.appName, {
          name: item.appName,
          count: (apps.get(item.appName)?.count || 0) + 1
        });
      }
      
      // Procesar cliente
      if (item.clientName) {
        if (!clients.has(item.clientName)) {
          clients.set(item.clientName, {
            name: item.clientName,
            users: new Set()
          });
        }
        
        // Agregar usuario a este cliente
        if (item.email) {
          clients.get(item.clientName).users.add(item.email);
        }
      }
      
      // Procesar usuario
      if (item.email) {
        users.set(item.email, {
          name: item.userName || 'Sin nombre',
          email: item.email,
          clientName: item.clientName || 'Sin cliente'
        });
      }
    });
    
    // Convertir los mapas a arrays para devolverlos
    return {
      applications: Array.from(apps.values()),
      clients: Array.from(clients.entries()).map(([name, data]) => ({
        name,
        userCount: data.users.size
      })),
      users: Array.from(users.values()),
      // También devolvemos los datos crudos para procesamiento adicional si es necesario
      rawData: combinedData
    };
  } catch (error) {
    console.error(`Error al obtener audiencia asignada a la noticia ${newsId}:`, error);
    return {
      applications: [],
      clients: [],
      users: [],
      rawData: []
    };
  }
};

/**
 * Obtiene los datos necesarios para mostrar y gestionar permisos
 * (Mantiene compatibilidad con el formato esperado por el componente PermissionsModal)
 * @param {string|number} newsId - ID de la noticia
 * @returns {Promise<Object>} Permisos de la noticia
 */
export const getNewsPermissions = async (newsId) => {
  try {
    // En lugar de simular datos, ahora obtenemos los datos reales
    const result = await getAssignedAudience(newsId);
    
    // Obtenemos los datos completos de aplicaciones, clientes y usuarios
    const allApps = await getApplications();
    const allClients = await getClients();
    const allUsers = await getUsers();
    
    // Conjuntos para almacenar los IDs seleccionados
    const selectedAppIds = new Set();
    const selectedClientIds = new Set();
    const selectedUserIds = new Set();
    
    // Mapear nombres de aplicaciones a IDs
    result.rawData.forEach(item => {
      if (item.appName) {
        const app = allApps.find(a => a.name === item.appName);
        if (app) {
          selectedAppIds.add(app.id);
        }
      }
      
      if (item.clientName) {
        const client = allClients.find(c => c.name === item.clientName);
        if (client) {
          selectedClientIds.add(client.id);
        }
      }
      
      if (item.email) {
        const user = allUsers.find(u => u.email === item.email);
        if (user) {
          selectedUserIds.add(user.id);
        }
      }
    });
    
    // Devolvemos los IDs en el formato esperado por el modal
    return {
      applications: Array.from(selectedAppIds),
      clients: Array.from(selectedClientIds),
      users: Array.from(selectedUserIds)
    };
  } catch (error) {
    console.error(`Error al obtener permisos de la noticia ${newsId}:`, error);
    return {
      applications: [],
      clients: [],
      users: []
    };
  }
};

/**
 * Guarda los permisos de una noticia
 * @param {string|number} newsId - ID de la noticia
 * @param {Object} permissions - Permisos a guardar
 * @returns {Promise<Object>} Permisos guardados
 */
export const saveNewsPermissions = async (newsId, permissions) => {
  try {
    console.log(`Guardando permisos para noticia ${newsId}:`, permissions);

    // Verificamos si hay aplicaciones seleccionadas - requisito obligatorio
    if (!permissions || !permissions.applications || permissions.applications.length === 0) {
      console.warn('No hay aplicaciones seleccionadas para guardar');
      return {
        success: false,
        message: 'Debe seleccionar al menos una aplicación para guardar permisos'
      };
    }

    // Verificamos si hay usuarios seleccionados
    if (!permissions.users || permissions.users.length === 0) {
      console.warn('No hay usuarios seleccionados para guardar');
      return {
        success: false,
        message: 'Debe seleccionar al menos un usuario para guardar permisos'
      };
    }

    // Obtenemos la lista completa de aplicaciones para identificar launcher
    const allApps = await getApplications();
    
    // Verificamos si "launcher" está entre las aplicaciones seleccionadas
    const launcherApp = allApps.find(app => 
      app.name && app.name.toLowerCase() === 'launcher' && 
      permissions.applications.includes(app.id)
    );

    let successCount = 0;

    // Si launcher está seleccionada, la enviamos por separado al endpoint específico
    if (launcherApp) {
      // Para cada usuario seleccionado enviamos a launcher
      for (const userId of permissions.users) {
        // Preparamos los datos en el formato esperado para launcher
        const launcherData = {
          IdUser: userId,
          IdNews: newsId.toString()
        };

        console.log('Enviando datos a launcher:', launcherData);
        // Enviamos cada usuario a launcher
        await audienciaService.insertarAudienciaLauncher(launcherData);
        successCount++;
      }
    }

    // Obtenemos las aplicaciones que no son launcher
    const otherApps = permissions.applications.filter(appId => 
      !launcherApp || appId !== launcherApp.id
    );

    // Si hay otras aplicaciones, las enviamos al endpoint general
    if (otherApps.length > 0) {
      // Obtenemos los datos sin procesar directamente del servicio para acceder a las relaciones usuario-compañía
      const audienciaResponse = await obtenerDatosAudiencia();
      const datosAudiencia = audienciaResponse.data || [];
      
      // Para cada combinación de usuario-aplicación, enviamos al endpoint general
      for (const appId of otherApps) {
        for (const userId of permissions.users) {
          // Buscamos el registro específico que relaciona este usuario con su compañía
          // para obtener el idUserCompany correcto
          const userCompanyRecord = datosAudiencia.find(item => 
            item.idUser && item.idUser.toString() === userId.toString()
          );
          
          if (userCompanyRecord && userCompanyRecord.idUserCompany) {
            // Preparamos los datos en el formato esperado para aplicaciones
            const appData = {
              IdUserCompany: userCompanyRecord.idUserCompany.toString(),
              IdApp: appId,
              IdNews: newsId.toString()
            };

            console.log('Enviando datos a insertarAudiencia:', appData);
            // Enviamos la combinación al endpoint general
            await audienciaService.insertarAudiencia(appData);
            successCount++;
          } else {
            console.warn(`No se encontró idUserCompany para el usuario ${userId}`);
          }
        }
      }
    }

    return {
      success: successCount > 0,
      message: successCount > 0 
        ? `Permisos guardados correctamente (${successCount} registros)` 
        : 'No se guardaron permisos',
      data: permissions
    };
  } catch (error) {
    console.error('Error al guardar permisos:', error);
    return {
      success: false,
      message: 'Error al guardar permisos: ' + (error.message || 'Error desconocido')
    };
  }
};

/**
 * Obtiene la relación entre clientes y usuarios
 * @returns {Promise<Object>} Mapa de relaciones
 */
export const getClientUserRelations = async () => {
  try {
    const { clientUserRelations } = await procesarDatosAudiencia();
    return clientUserRelations; // Eliminado el delay artificial
  } catch (error) {
    console.error('Error al obtener relaciones cliente-usuario:', error);
    return {};
  }
};

/**
 * Obtiene los usuarios de un cliente específico
 * @param {string} clientId - ID del cliente
 * @returns {Promise<Array>} Lista de usuarios del cliente
 */
export const getUsersByClient = async (clientId) => {
  try {
    const { clientUserRelations, users } = await procesarDatosAudiencia();
    const userIds = clientUserRelations[clientId] || [];
    const clientUsers = users.filter(user => userIds.includes(user.id));
    return clientUsers; // Eliminado el delay artificial
  } catch (error) {
    console.error(`Error al obtener usuarios del cliente ${clientId}:`, error);
    return [];
  }
};

export const newsPermissionsService = {
  getApplications,
  getClients,
  getUsers,
  getNewsPermissions,
  getAssignedAudience,
  saveNewsPermissions,
  getClientUserRelations,
  getUsersByClient
};

export default procesarDatosAudiencia;