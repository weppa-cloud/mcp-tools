/**
 * PropertyFilter Service
 * 
 * Intelligently filters node properties to return only essential and commonly-used ones.
 * Reduces property count from 200+ to 10-20 for better AI agent usability.
 */

export interface SimplifiedProperty {
  name: string;
  displayName: string;
  type: string;
  description: string;
  default?: any;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  placeholder?: string;
  showWhen?: Record<string, any>;
  usageHint?: string;
}

export interface EssentialConfig {
  required: string[];
  common: string[];
  categoryPriority?: string[];
}

export interface FilteredProperties {
  required: SimplifiedProperty[];
  common: SimplifiedProperty[];
}

export class PropertyFilter {
  /**
   * Curated lists of essential properties for the most commonly used nodes.
   * Based on analysis of typical workflows and AI agent needs.
   */
  private static ESSENTIAL_PROPERTIES: Record<string, EssentialConfig> = {
    // HTTP Request - Most used node
    'nodes-base.httpRequest': {
      required: ['url'],
      common: ['method', 'authentication', 'sendBody', 'contentType', 'sendHeaders'],
      categoryPriority: ['basic', 'authentication', 'request', 'response', 'advanced']
    },
    
    // Webhook - Entry point for many workflows
    'nodes-base.webhook': {
      required: [],
      common: ['httpMethod', 'path', 'responseMode', 'responseData', 'responseCode'],
      categoryPriority: ['basic', 'response', 'advanced']
    },
    
    // Code - For custom logic
    'nodes-base.code': {
      required: [],
      common: ['language', 'jsCode', 'pythonCode', 'mode'],
      categoryPriority: ['basic', 'code', 'advanced']
    },
    
    // Set - Data manipulation
    'nodes-base.set': {
      required: [],
      common: ['mode', 'assignments', 'includeOtherFields', 'options'],
      categoryPriority: ['basic', 'data', 'advanced']
    },
    
    // If - Conditional logic
    'nodes-base.if': {
      required: [],
      common: ['conditions', 'combineOperation'],
      categoryPriority: ['basic', 'conditions', 'advanced']
    },
    
    // PostgreSQL - Database operations
    'nodes-base.postgres': {
      required: [],
      common: ['operation', 'table', 'query', 'additionalFields', 'returnAll'],
      categoryPriority: ['basic', 'query', 'options', 'advanced']
    },
    
    // OpenAI - AI operations
    'nodes-base.openAi': {
      required: [],
      common: ['resource', 'operation', 'modelId', 'prompt', 'messages', 'maxTokens'],
      categoryPriority: ['basic', 'model', 'input', 'options', 'advanced']
    },
    
    // Google Sheets - Spreadsheet operations
    'nodes-base.googleSheets': {
      required: [],
      common: ['operation', 'documentId', 'sheetName', 'range', 'dataStartRow'],
      categoryPriority: ['basic', 'location', 'data', 'options', 'advanced']
    },
    
    // Slack - Messaging
    'nodes-base.slack': {
      required: [],
      common: ['resource', 'operation', 'channel', 'text', 'attachments', 'blocks'],
      categoryPriority: ['basic', 'message', 'formatting', 'advanced']
    },
    
    // Email - Email operations
    'nodes-base.email': {
      required: [],
      common: ['resource', 'operation', 'fromEmail', 'toEmail', 'subject', 'text', 'html'],
      categoryPriority: ['basic', 'recipients', 'content', 'advanced']
    },
    
    // Merge - Combining data streams
    'nodes-base.merge': {
      required: [],
      common: ['mode', 'joinMode', 'propertyName1', 'propertyName2', 'outputDataFrom'],
      categoryPriority: ['basic', 'merge', 'advanced']
    },
    
    // Function (legacy) - Custom functions
    'nodes-base.function': {
      required: [],
      common: ['functionCode'],
      categoryPriority: ['basic', 'code', 'advanced']
    },
    
    // Split In Batches - Batch processing
    'nodes-base.splitInBatches': {
      required: [],
      common: ['batchSize', 'options'],
      categoryPriority: ['basic', 'options', 'advanced']
    },
    
    // Redis - Cache operations
    'nodes-base.redis': {
      required: [],
      common: ['operation', 'key', 'value', 'keyType', 'expire'],
      categoryPriority: ['basic', 'data', 'options', 'advanced']
    },
    
    // MongoDB - NoSQL operations
    'nodes-base.mongoDb': {
      required: [],
      common: ['operation', 'collection', 'query', 'fields', 'limit'],
      categoryPriority: ['basic', 'query', 'options', 'advanced']
    },
    
    // MySQL - Database operations
    'nodes-base.mySql': {
      required: [],
      common: ['operation', 'table', 'query', 'columns', 'additionalFields'],
      categoryPriority: ['basic', 'query', 'options', 'advanced']
    },
    
    // FTP - File transfer
    'nodes-base.ftp': {
      required: [],
      common: ['operation', 'path', 'fileName', 'binaryData'],
      categoryPriority: ['basic', 'file', 'options', 'advanced']
    },
    
    // SSH - Remote execution
    'nodes-base.ssh': {
      required: [],
      common: ['resource', 'operation', 'command', 'path', 'cwd'],
      categoryPriority: ['basic', 'command', 'options', 'advanced']
    },
    
    // Execute Command - Local execution
    'nodes-base.executeCommand': {
      required: [],
      common: ['command', 'cwd'],
      categoryPriority: ['basic', 'advanced']
    },
    
    // GitHub - Version control operations
    'nodes-base.github': {
      required: [],
      common: ['resource', 'operation', 'owner', 'repository', 'title', 'body'],
      categoryPriority: ['basic', 'repository', 'content', 'advanced']
    }
  };
  
  /**
   * Deduplicate properties based on name and display conditions
   */
  static deduplicateProperties(properties: any[]): any[] {
    const seen = new Map<string, any>();
    
    return properties.filter(prop => {
      // Create unique key from name + conditions
      const conditions = JSON.stringify(prop.displayOptions || {});
      const key = `${prop.name}_${conditions}`;
      
      if (seen.has(key)) {
        return false; // Skip duplicate
      }
      
      seen.set(key, prop);
      return true;
    });
  }
  
  /**
   * Get essential properties for a node type
   */
  static getEssentials(allProperties: any[], nodeType: string): FilteredProperties {
    // Deduplicate first
    const uniqueProperties = this.deduplicateProperties(allProperties);
    const config = this.ESSENTIAL_PROPERTIES[nodeType];
    
    if (!config) {
      // Fallback for unconfigured nodes
      return this.inferEssentials(uniqueProperties);
    }
    
    // Extract required properties
    const required = this.extractProperties(uniqueProperties, config.required, true);
    
    // Extract common properties (excluding any already in required)
    const requiredNames = new Set(required.map(p => p.name));
    const common = this.extractProperties(uniqueProperties, config.common, false)
      .filter(p => !requiredNames.has(p.name));
    
    return { required, common };
  }
  
  /**
   * Extract and simplify specified properties
   */
  private static extractProperties(
    allProperties: any[], 
    propertyNames: string[], 
    markAsRequired: boolean
  ): SimplifiedProperty[] {
    const extracted: SimplifiedProperty[] = [];
    
    for (const name of propertyNames) {
      const property = this.findPropertyByName(allProperties, name);
      if (property) {
        const simplified = this.simplifyProperty(property);
        if (markAsRequired) {
          simplified.required = true;
        }
        extracted.push(simplified);
      }
    }
    
    return extracted;
  }
  
  /**
   * Find a property by name, including in nested collections
   */
  private static findPropertyByName(properties: any[], name: string): any | undefined {
    for (const prop of properties) {
      if (prop.name === name) {
        return prop;
      }
      
      // Check in nested collections
      if (prop.type === 'collection' && prop.options) {
        const found = this.findPropertyByName(prop.options, name);
        if (found) return found;
      }
      
      // Check in fixed collections
      if (prop.type === 'fixedCollection' && prop.options) {
        for (const option of prop.options) {
          if (option.values) {
            const found = this.findPropertyByName(option.values, name);
            if (found) return found;
          }
        }
      }
    }
    
    return undefined;
  }
  
  /**
   * Simplify a property for AI consumption
   */
  private static simplifyProperty(prop: any): SimplifiedProperty {
    const simplified: SimplifiedProperty = {
      name: prop.name,
      displayName: prop.displayName || prop.name,
      type: prop.type,
      description: this.extractDescription(prop),
      required: prop.required || false
    };
    
    // Include default value if it's simple
    if (prop.default !== undefined && 
        typeof prop.default !== 'object' || 
        prop.type === 'options' || 
        prop.type === 'multiOptions') {
      simplified.default = prop.default;
    }
    
    // Include placeholder
    if (prop.placeholder) {
      simplified.placeholder = prop.placeholder;
    }
    
    // Simplify options for select fields
    if (prop.options && Array.isArray(prop.options)) {
      simplified.options = prop.options.map((opt: any) => {
        if (typeof opt === 'string') {
          return { value: opt, label: opt };
        }
        return {
          value: opt.value || opt.name,
          label: opt.name || opt.value || opt.displayName
        };
      });
    }
    
    // Include simple display conditions (max 2 conditions)
    if (prop.displayOptions?.show) {
      const conditions = Object.keys(prop.displayOptions.show);
      if (conditions.length <= 2) {
        simplified.showWhen = prop.displayOptions.show;
      }
    }
    
    // Add usage hints based on property characteristics
    simplified.usageHint = this.generateUsageHint(prop);
    
    return simplified;
  }
  
  /**
   * Generate helpful usage hints for properties
   */
  private static generateUsageHint(prop: any): string | undefined {
    // URL properties
    if (prop.name.toLowerCase().includes('url') || prop.name === 'endpoint') {
      return 'Enter the full URL including https://';
    }
    
    // Authentication properties
    if (prop.name.includes('auth') || prop.name.includes('credential')) {
      return 'Select authentication method or credentials';
    }
    
    // JSON properties
    if (prop.type === 'json' || prop.name.includes('json')) {
      return 'Enter valid JSON data';
    }
    
    // Code properties
    if (prop.type === 'code' || prop.name.includes('code')) {
      return 'Enter your code here';
    }
    
    // Boolean with specific behaviors
    if (prop.type === 'boolean' && prop.displayOptions) {
      return 'Enabling this will show additional options';
    }
    
    return undefined;
  }
  
  /**
   * Extract description from various possible fields
   */
  private static extractDescription(prop: any): string {
    // Try multiple fields where description might be stored
    const description = prop.description || 
                       prop.hint || 
                       prop.placeholder || 
                       prop.displayName ||
                       '';
    
    // If still empty, generate based on property characteristics
    if (!description) {
      return this.generateDescription(prop);
    }
    
    return description;
  }
  
  /**
   * Generate a description based on property characteristics
   */
  private static generateDescription(prop: any): string {
    const name = prop.name.toLowerCase();
    const type = prop.type;
    
    // Common property descriptions
    const commonDescriptions: Record<string, string> = {
      'url': 'The URL to make the request to',
      'method': 'HTTP method to use for the request',
      'authentication': 'Authentication method to use',
      'sendbody': 'Whether to send a request body',
      'contenttype': 'Content type of the request body',
      'sendheaders': 'Whether to send custom headers',
      'jsonbody': 'JSON data to send in the request body',
      'headers': 'Custom headers to send with the request',
      'timeout': 'Request timeout in milliseconds',
      'query': 'SQL query to execute',
      'table': 'Database table name',
      'operation': 'Operation to perform',
      'path': 'Webhook path or file path',
      'httpmethod': 'HTTP method to accept',
      'responsemode': 'How to respond to the webhook',
      'responsecode': 'HTTP response code to return',
      'channel': 'Slack channel to send message to',
      'text': 'Text content of the message',
      'subject': 'Email subject line',
      'fromemail': 'Sender email address',
      'toemail': 'Recipient email address',
      'language': 'Programming language to use',
      'jscode': 'JavaScript code to execute',
      'pythoncode': 'Python code to execute'
    };
    
    // Check for exact match
    if (commonDescriptions[name]) {
      return commonDescriptions[name];
    }
    
    // Check for partial matches
    for (const [key, desc] of Object.entries(commonDescriptions)) {
      if (name.includes(key)) {
        return desc;
      }
    }
    
    // Type-based descriptions
    if (type === 'boolean') {
      return `Enable or disable ${prop.displayName || name}`;
    } else if (type === 'options') {
      return `Select ${prop.displayName || name}`;
    } else if (type === 'string') {
      return `Enter ${prop.displayName || name}`;
    } else if (type === 'number') {
      return `Number value for ${prop.displayName || name}`;
    } else if (type === 'json') {
      return `JSON data for ${prop.displayName || name}`;
    }
    
    return `Configure ${prop.displayName || name}`;
  }
  
  /**
   * Infer essentials for nodes without curated lists
   */
  private static inferEssentials(properties: any[]): FilteredProperties {
    // Extract explicitly required properties
    const required = properties
      .filter(p => p.required === true)
      .map(p => this.simplifyProperty(p));
    
    // Find common properties (simple, always visible, at root level)
    const common = properties
      .filter(p => {
        return !p.required && 
               !p.displayOptions && 
               p.type !== 'collection' && 
               p.type !== 'fixedCollection' &&
               !p.name.startsWith('options');
      })
      .slice(0, 5) // Take first 5 simple properties
      .map(p => this.simplifyProperty(p));
    
    // If we have very few properties, include some conditional ones
    if (required.length + common.length < 5) {
      const additional = properties
        .filter(p => {
          return !p.required &&
                 p.displayOptions &&
                 Object.keys(p.displayOptions.show || {}).length === 1;
        })
        .slice(0, 5 - (required.length + common.length))
        .map(p => this.simplifyProperty(p));
      
      common.push(...additional);
    }
    
    return { required, common };
  }
  
  /**
   * Search for properties matching a query
   */
  static searchProperties(
    allProperties: any[], 
    query: string,
    maxResults: number = 20
  ): SimplifiedProperty[] {
    const lowerQuery = query.toLowerCase();
    const matches: Array<{ property: any; score: number; path: string }> = [];
    
    this.searchPropertiesRecursive(allProperties, lowerQuery, matches);
    
    // Sort by score and return top results
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(match => ({
        ...this.simplifyProperty(match.property),
        path: match.path
      } as SimplifiedProperty & { path: string }));
  }
  
  /**
   * Recursively search properties including nested ones
   */
  private static searchPropertiesRecursive(
    properties: any[],
    query: string,
    matches: Array<{ property: any; score: number; path: string }>,
    path: string = ''
  ): void {
    for (const prop of properties) {
      const currentPath = path ? `${path}.${prop.name}` : prop.name;
      let score = 0;
      
      // Check name match
      if (prop.name.toLowerCase() === query) {
        score = 10; // Exact match
      } else if (prop.name.toLowerCase().startsWith(query)) {
        score = 8; // Prefix match
      } else if (prop.name.toLowerCase().includes(query)) {
        score = 5; // Contains match
      }
      
      // Check display name match
      if (prop.displayName?.toLowerCase().includes(query)) {
        score = Math.max(score, 4);
      }
      
      // Check description match
      if (prop.description?.toLowerCase().includes(query)) {
        score = Math.max(score, 3);
      }
      
      if (score > 0) {
        matches.push({ property: prop, score, path: currentPath });
      }
      
      // Search nested properties
      if (prop.type === 'collection' && prop.options) {
        this.searchPropertiesRecursive(prop.options, query, matches, currentPath);
      } else if (prop.type === 'fixedCollection' && prop.options) {
        for (const option of prop.options) {
          if (option.values) {
            this.searchPropertiesRecursive(
              option.values, 
              query, 
              matches, 
              `${currentPath}.${option.name}`
            );
          }
        }
      }
    }
  }
}