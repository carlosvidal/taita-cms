import api from '@/utils/api'

/**
 * Composable para obtener información del blog activo
 */
export function useBlog() {
  /**
   * Obtiene el ID numérico del blog activo desde localStorage
   * @returns {Promise<number>} El ID del blog activo
   */
  const getCurrentBlogId = async () => {
    // Intentar obtener el blog activo del localStorage (UUID)
    const activeBlogUuid = localStorage.getItem('activeBlog');

    if (activeBlogUuid) {
      try {
        // Obtener el blog por UUID para conseguir el ID numérico
        const response = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
        const blogId = response.data.id;
        console.log('[useBlog.getCurrentBlogId] Using active blog ID:', blogId, 'from UUID:', activeBlogUuid);
        return blogId;
      } catch (error) {
        console.error('[useBlog.getCurrentBlogId] Error fetching blog by UUID:', error);
      }
    }

    // Fallback: intentar desde la URL
    const pathParts = window.location.pathname.split('/');
    const blogIdIndex = pathParts.findIndex(part => part === 'blog') + 1;
    const blogId = pathParts[blogIdIndex];

    if (blogId && !isNaN(blogId)) {
      console.log('[useBlog.getCurrentBlogId] Using blog ID from URL:', blogId);
      return parseInt(blogId);
    }

    // Último fallback
    console.warn('[useBlog.getCurrentBlogId] No blog ID found, defaulting to 1');
    return 1;
  };

  /**
   * Obtiene el UUID del blog activo desde localStorage
   * @returns {string|null} El UUID del blog activo
   */
  const getActiveBlogUuid = () => {
    return localStorage.getItem('activeBlog');
  };

  /**
   * Obtiene toda la información del blog activo
   * @returns {Promise<Object|null>} Los datos del blog activo
   */
  const getActiveBlog = async () => {
    const activeBlogUuid = getActiveBlogUuid();

    if (activeBlogUuid) {
      try {
        const response = await api.get(`/api/blogs/uuid/${activeBlogUuid}`);
        console.log('[useBlog.getActiveBlog] Active blog:', response.data);
        return response.data;
      } catch (error) {
        console.error('[useBlog.getActiveBlog] Error fetching blog:', error);
      }
    }

    return null;
  };

  return {
    getCurrentBlogId,
    getActiveBlogUuid,
    getActiveBlog
  };
}
