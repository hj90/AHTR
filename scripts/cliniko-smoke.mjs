import { ClinikoClient, buildPath } from './lib/cliniko-client.mjs';
import { loadLocalEnv } from './lib/local-env.mjs';

const env = await loadLocalEnv();
const cliniko = ClinikoClient.fromEnv(env);

const [businesses, practitioners, appointmentTypes, patients] = await Promise.all([
  cliniko.get(buildPath('/businesses', { per_page: 100 })),
  cliniko.get(buildPath('/practitioners', { per_page: 100 })),
  cliniko.get(buildPath('/appointment_types', { per_page: 100 })),
  cliniko.get(buildPath('/patients', { per_page: 1 })),
]);

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl: cliniko.baseUrl,
      businesses: businesses.businesses?.length ?? 0,
      practitioners: practitioners.practitioners?.length ?? 0,
      appointmentTypes: appointmentTypes.appointment_types?.length ?? 0,
      totalPatients: patients.total_entries ?? null,
    },
    null,
    2,
  ),
);
