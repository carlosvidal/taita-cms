/**
 * Convierte un texto en un slug válido para URLs
 * @param {string} text - El texto a convertir en slug
 * @returns {string} - El slug generado
 */
export function slugify(text) {
  if (!text) return '';
  
  // Convertir a minúsculas y normalizar caracteres especiales
  return text
    .toString()
    .normalize('NFD')                   // Normalizar acentos
    .replace(/[\u0300-\u036f]/g, '')    // Eliminar diacríticos
    .toLowerCase()                      // Convertir a minúsculas
    .trim()                             // Eliminar espacios al inicio y final
    .replace(/\s+/g, '-')               // Reemplazar espacios con guiones
    .replace(/[^\w\-]+/g, '')           // Eliminar caracteres no alfanuméricos
    .replace(/\-\-+/g, '-')             // Reemplazar múltiples guiones con uno solo
    .replace(/^-+/, '')                 // Eliminar guiones al inicio
    .replace(/-+$/, '');                // Eliminar guiones al final
}

/**
 * Genera un slug único añadiendo un timestamp si es necesario
 * @param {string} text - El texto base para el slug
 * @param {boolean} [addTimestamp=false] - Si se debe añadir un timestamp
 * @returns {string} - El slug único generado
 */
export function generateUniqueSlug(text, addTimestamp = false) {
  const baseSlug = slugify(text);
  
  if (!baseSlug) return '';
  
  if (addTimestamp) {
    const timestamp = new Date().getTime().toString().slice(-4);
    return `${baseSlug}-${timestamp}`;
  }
  
  return baseSlug;
}
