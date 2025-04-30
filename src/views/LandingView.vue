<template>
  <!-- Hero Section -->
  <section class="w-full bg-gradient-to-br from-slate-50 to-blue-100 pt-12 pb-16 px-4">
    <div class="max-w-3xl mx-auto flex flex-col items-center gap-8">
      <div class="w-full text-center">
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">Crea tu blog profesional en minutos</h1>
        <p class="text-lg md:text-xl text-slate-600 mb-8">Gestiona tu contenido, personaliza tu espacio y haz crecer tu audiencia con nuestro CMS sencillo y potente.</p>
        <div class="flex gap-4 justify-center mb-8">
          <router-link to="/login" class="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition">Iniciar sesión</router-link>
        </div>
      </div>
      <div class="w-full flex justify-center">
        <div class="max-w-md w-full">
          <SignupForm />
        </div>
      </div>
    </div>
  </section>

  <!-- Sección descriptiva -->
  <section class="w-full bg-white py-12 px-4">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-2xl md:text-3xl font-bold mb-4 text-slate-800">El motor de blogs más flexible y moderno</h2>
      <p class="text-lg text-slate-600 mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris euismod, urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis enim lorem nec neque. Integer placerat, ex nec dictum facilisis, risus nisi cursus neque, ac facilisis enim enim nec tortor.</p>
    </div>
  </section>

  <!-- Tabla de planes y precios -->
  <section class="w-full bg-gradient-to-b from-blue-50 to-slate-100 py-12 px-4">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800">Planes y Precios</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse rounded-lg overflow-hidden shadow">
          <thead>
            <tr class="bg-blue-100 text-slate-700">
              <th class="py-4 px-6 text-left text-lg font-semibold">Características</th>
              <th class="py-4 px-6 text-center text-lg font-semibold">Gratis</th>
              <th class="py-4 px-6 text-center text-lg font-semibold">Pagado</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr>
              <td class="py-3 px-6 font-medium">Duración</td>
              <td class="py-3 px-6 text-center">De por vida</td>
              <td class="py-3 px-6 text-center">Mensual o Anual</td>
            </tr>
            <tr>
              <td class="py-3 px-6 font-medium">Dominio</td>
              <td class="py-3 px-6 text-center">Subdominio</td>
              <td class="py-3 px-6 text-center">Dominio propio</td>
            </tr>
            <tr>
              <td class="py-3 px-6 font-medium">Artículos y páginas</td>
              <td class="py-3 px-6 text-center">Ilimitados</td>
              <td class="py-3 px-6 text-center">Ilimitados</td>
            </tr>
            <tr>
              <td class="py-3 px-6 font-medium">Series</td>
              <td class="py-3 px-6 text-center text-gray-400">—</td>
              <td class="py-3 px-6 text-center">Sí</td>
            </tr>
            <tr>
              <td class="py-3 px-6 font-medium">Google Analytics</td>
              <td class="py-3 px-6 text-center text-gray-400">—</td>
              <td class="py-3 px-6 text-center">Sí</td>
            </tr>
            <tr>
              <td class="py-3 px-6 font-medium">Publicidad</td>
              <td class="py-3 px-6 text-center">Incluida</td>
              <td class="py-3 px-6 text-center">Sin publicidad</td>
            </tr>
            <tr>
              <td class="py-3 px-6 font-medium">Patreon Widget</td>
              <td class="py-3 px-6 text-center text-gray-400">—</td>
              <td class="py-3 px-6 text-center">Sí</td>
            </tr>
            <tr class="bg-blue-50">
              <td class="py-4 px-6 font-bold text-lg">Precio</td>
              <td class="py-4 px-6 text-center font-bold text-green-600 text-lg">$0</td>
              <td class="py-4 px-6 text-center">
                <div class="flex flex-col gap-2 items-center">
                  <span class="font-bold text-blue-700 text-lg">$9.99/mes</span>
                  <span class="font-bold text-blue-700 text-lg">$99.99/año</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import SignupForm from '@/components/SignupForm.vue'
</script>

<style scoped>

</style>
