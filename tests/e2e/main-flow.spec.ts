import { expect, test } from '@playwright/test';

test('local browser-only SIRA form flow does not transmit form values', async ({ page }) => {
  const requests: Array<{ url: string; method: string; postData: string; headers: string }> = [];
  const distinctiveValues = [
    'Network Sentinel Patient',
    '0400000000',
    'sentinel@example.test',
    'Synthetic network privacy phrase',
  ];

  page.on('request', (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      postData: request.postData() ?? '',
      headers: JSON.stringify(request.headers()),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /start form/i }).click();
  await expect(page.getByRole('button', { name: /request details.*not started/i })).toBeVisible();
  await expect(page.getByText(/Date services first commenced means/i)).toBeHidden();
  await page.getByText('How to fill this step').click();
  await expect(page.getByText(/Date services first commenced means/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /full SIRA explanatory notes/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.length + sessionStorage.length))
    .toBe(0);

  await page.locator('#requestNumber').fill('REQ-SENTINEL-001');
  await page.locator('#requestDate').fill('2026-08-13');
  await page.locator('#servicesFirstCommenced').fill('2026-08-01');
  await page.locator('#consultationsToDate').fill('3');
  await page.locator('#discipline').selectOption('Physiotherapist');
  await page.locator('#referredBy').fill('Dr Example');
  await page.locator('#requestPhone').fill(distinctiveValues[1]);
  await expect(page.getByRole('button', { name: /request details.*complete/i })).toBeVisible();
  await page.getByRole('button', { name: /next section/i }).click();
  await expect(
    page.getByRole('button', { name: /details of person with an injury.*not started/i }),
  ).toBeVisible();

  await page.locator('#personName').fill(distinctiveValues[0]);
  await page.locator('#dateOfBirth').fill('1990-01-01');
  await page.locator('#preInjuryOccupation').fill('Retail assistant');
  await page.locator('#preInjuryWorkHours').fill('38');
  await page.locator('#claimNumber').fill('CLAIM-001');
  await page.locator('#injuryDate').fill('2026-07-10');

  await page.getByRole('button', { name: /request details/i }).click();
  await expect(page.locator('#requestNumber')).toHaveValue('REQ-SENTINEL-001');
  await page.getByRole('button', { name: /details of person/i }).click();
  await expect(page.locator('#personName')).toHaveValue(distinctiveValues[0]);
  await page.getByRole('button', { name: /next section/i }).click();

  await page.locator('#compensableInjury').fill('Synthetic shoulder strain');
  await page.locator('#clinicalSigns').fill('Synthetic clinical signs.');
  await page.getByRole('button', { name: /next section/i }).click();

  await page.locator('#workPreInjuryCapacity').fill('Full ordinary duties.');
  await page.locator('#workCurrentCapacity').fill('Suitable duties.');
  await page.locator('#activitiesPreInjuryCapacity').fill('Independent daily activity.');
  await page.locator('#activitiesCurrentCapacity').fill('Reduced lifting tolerance.');
  await page.getByRole('button', { name: /next section/i }).click();

  await page
    .locator('#som1Measure')
    .selectOption('Quick Disabilities of the Arm Shoulder and Hand (QuickDASH)');
  await page.locator('#som1InitialDate').fill('2026-07-15');
  await page.locator('#som1InitialScore').fill('65');
  await page.locator('#som1PreviousScore').fill('N/A');
  await page.locator('#som1CurrentDate').fill('2026-08-13');
  await page.locator('#som1CurrentScore').fill('42');
  await page.locator('#barriersToRecovery').fill('Workload barriers.');
  await page.getByRole('button', { name: /next section/i }).click();

  await page.locator('#recoveryStrategies').fill(distinctiveValues[3]);
  await page.getByRole('button', { name: /next section/i }).click();

  await page.locator('#workGoal').fill('Return to modified duties.');
  await page.locator('#activityGoal').fill('Resume household tasks.');
  await page.locator('#selfManagement').fill('Daily exercise program.');
  await page.locator('#intervention').fill('Exercise progression.');
  await page.locator('#serviceRationale').fill('Supports return to work.');
  await page.locator('#additionalSessions').fill('6');
  await page.locator('#anticipatedDischargeDate').fill('2026-10-01');
  await page.getByRole('button', { name: /next section/i }).click();

  await page.locator('#service1Type').fill('Physiotherapy consultation');
  await page.locator('#service1Sessions').fill('6');
  await page.locator('#service1Frequency').fill('1/week');
  await page.locator('#service1Cost').fill('120');
  await expect(page.getByText('$720')).toHaveCount(2);
  await page.getByRole('button', { name: /next section/i }).click();

  await page.locator('#practitionerName').fill('Alex Clinician');
  await page.locator('#practiceEmail').fill(distinctiveValues[2]);
  await page.locator('#ahpraNumber').fill('PHY0000000000');
  await page.locator('#bestContactTime').fill('Weekday mornings');
  await page.locator('#practiceName').fill('Example Allied Health');
  await page.locator('#suburb').fill('Sydney');
  await page.locator('#state').fill('NSW');
  await page.locator('#postcode').fill('2000');
  await page.locator('#treatingPractitionerEmail').fill('clinician@example.com');
  await page.locator('#phoneNumber').fill('0290000000');
  await page.locator('#fax').fill('0290000001');
  await page.locator('#practitionerSignature').fill('Alex Clinician');

  await expect
    .poll(() => page.evaluate(() => localStorage.length + sessionStorage.length))
    .toBe(0);

  await page.getByRole('button', { name: /review form/i }).click();
  await expect(page.getByText(distinctiveValues[0])).toBeVisible();

  await page.getByRole('button', { name: /generate pdf/i }).click();
  await expect(page.getByRole('link', { name: /download pdf/i })).toBeVisible();

  await page.getByRole('button', { name: /start a new form/i }).click();
  await expect(page.locator('#requestNumber')).toHaveValue('');

  const requestText = requests
    .filter((request) => request.method !== 'GET' || !request.url.endsWith('.pdf'))
    .map((request) => `${request.url}\n${request.postData}\n${request.headers}`)
    .join('\n');

  for (const value of distinctiveValues) {
    expect(requestText).not.toContain(value);
  }
});
