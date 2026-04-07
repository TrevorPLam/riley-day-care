// Quick debug test
const { enrollmentSchema } = require('./lib/validation/enrollment.js')

// Test the problematic cases
const testPhone1 = '555-123-4567 ext. 123'
const testData1 = {
  parentName: 'John Doe',
  childName: 'Jane Doe', 
  childAge: '3 years',
  startDate: '2024-06-01',
  phone: testPhone1,
  email: 'john.doe@example.com'
}

const result1 = enrollmentSchema.safeParse(testData1)
console.log('Phone test 1:', testPhone1)
console.log('Success:', result1.success)
if (!result1.success) {
  console.log('Error:', result1.error.issues[0]?.message)
}

// Test dates
const testDates = ['2024/06/01', '06-01-2024', 'June 1, 2024', '2024-13-01', '2024-06-32']
testDates.forEach(date => {
  const testData = { ...testData1, startDate: date }
  const result = enrollmentSchema.safeParse(testData)
  console.log(`Date "${date}":`, result.success)
  if (!result.success) {
    console.log('Error:', result.error.issues[0]?.message)
  }
})
