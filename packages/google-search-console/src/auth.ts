import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface GoogleSearchConsoleConfig {
  credentialsPath?: string;
  siteUrl: string;
}

export async function createSearchConsoleClient(config: GoogleSearchConsoleConfig) {
  let auth: OAuth2Client;

  if (config.credentialsPath) {
    // Usar credenciales desde archivo
    const credentialsContent = await fs.readFile(config.credentialsPath, 'utf-8');
    const credentials = JSON.parse(credentialsContent);

    if (credentials.type === 'service_account') {
      // Service Account
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      }) as any;
    } else {
      // OAuth2 credentials
      const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;
      auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
      
      // Aquí necesitarías implementar el flujo OAuth2 completo
      // Por simplicidad, asumimos que ya tienes un refresh token
      const tokenPath = path.join(path.dirname(config.credentialsPath), 'token.json');
      try {
        const tokenContent = await fs.readFile(tokenPath, 'utf-8');
        const token = JSON.parse(tokenContent);
        auth.setCredentials(token);
      } catch (error) {
        throw new Error('No se encontró token de autenticación. Ejecuta el proceso de autorización primero.');
      }
    }
  } else {
    // Usar Application Default Credentials
    auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    }) as any;
  }

  // Crear cliente de Search Console
  const searchConsole = google.searchconsole({
    version: 'v1',
    auth: auth as any,
  });

  // Verificar acceso al sitio
  try {
    await searchConsole.sites.get({ siteUrl: config.siteUrl });
  } catch (error: any) {
    if (error.code === 403) {
      throw new Error(`No tienes acceso al sitio: ${config.siteUrl}. Verifica que la cuenta tenga permisos en Search Console.`);
    }
    throw error;
  }

  return searchConsole;
}

export async function validateSiteAccess(searchConsole: any, siteUrl: string): Promise<boolean> {
  try {
    const response = await searchConsole.sites.list();
    const sites = response.data.siteEntry || [];
    return sites.some((site: any) => site.siteUrl === siteUrl);
  } catch (error) {
    console.error('Error validando acceso al sitio:', error);
    return false;
  }
}

export async function getSitesList(searchConsole: any): Promise<string[]> {
  try {
    const response = await searchConsole.sites.list();
    const sites = response.data.siteEntry || [];
    return sites.map((site: any) => site.siteUrl);
  } catch (error) {
    console.error('Error obteniendo lista de sitios:', error);
    return [];
  }
}