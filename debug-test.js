import { enrollmentSchema } from './lib/validation/enrollment'

// Test specific problematic cases
const testCases = [
  { field: 'startDate', value: '2024-6-1' },
  { field: 'phone', value: '555-123-4567 ext. 123' },
  { field: 'phone', value: '(555) 123-4567 x123' },
  { field: 'phone', value: '555.123.4567@' },
  { field: 'phone', value: 'phone: 555-123-4567' }
]

testCases.forEach(({ field, value }) => {
  const testData = {
    parentName: 'John Doe',
    childName: 'Jane Doe',
    childAge: '3 years',
    startDate: '2024-06-01',
    phone: '(555) 123-4567',
    email: 'john.doe@example.com',
    [field]: value
  }
  
  console.log(`Testing ${field}: "${value}"`)
  const result = enrollmentSchema.safeParse(testData)
  console.log('Success:', result.success)
  if (!result.success) {
    console.log('Error:', result.error.issues[0]?.message)
  }
  console.log('---')
})
