import { describe, test, expect } from 'vitest'
import { enrollmentSchema, formatZodErrors, type EnrollmentData } from '@/lib/validation/enrollment'
import { createMockEnrollmentData, createInvalidEnrollmentData, expectValidationToPass, expectValidationToFail } from '../../test-utils'

describe('Enrollment Validation Schema', () => {
  describe('Valid Data', () => {
    test('should accept valid enrollment data', () => {
      const validData = createMockEnrollmentData()
      expectValidationToPass(enrollmentSchema, validData)
    })

    test('should accept data without optional message field', () => {
      const dataWithoutMessage = createMockEnrollmentData({ message: undefined })
      expectValidationToPass(enrollmentSchema, dataWithoutMessage)
    })

    test('should accept data with empty message', () => {
      const dataWithEmptyMessage = createMockEnrollmentData({ message: '' })
      const result = enrollmentSchema.safeParse(dataWithEmptyMessage)
      expect(result.success).toBe(true)
      expect(result.data.message).toBeUndefined()
    })

    test('should accept trimmed message', () => {
      const dataWithTrimmedMessage = createMockEnrollmentData({ message: '  Test message  ' })
      const result = enrollmentSchema.safeParse(dataWithTrimmedMessage)
      expect(result.success).toBe(true)
      expect(result.data.message).toBe('Test message')
    })
  })

  describe('Parent Name Validation', () => {
    test('should reject empty parent name', () => {
      const invalidData = createInvalidEnrollmentData('parentName', '')
      expectValidationToFail(enrollmentSchema, invalidData, 'Parent/guardian name is required')
    })

    test('should reject parent name that is too long', () => {
      const invalidData = createInvalidEnrollmentData('parentName', 'a'.repeat(101))
      expectValidationToFail(enrollmentSchema, invalidData, 'Name must be under 100 characters')
    })

    test('should accept valid parent names', () => {
      const validNames = ['John Doe', 'Mary-Jane Smith', 'Dr. John A. Smith Jr.', 'O\'Connor']
      validNames.forEach(name => {
        const data = createMockEnrollmentData({ parentName: name })
        expectValidationToPass(enrollmentSchema, data)
      })
    })
  })

  describe('Child Name Validation', () => {
    test('should reject empty child name', () => {
      const invalidData = createInvalidEnrollmentData('childName', '')
      expectValidationToFail(enrollmentSchema, invalidData, 'Child\'s name is required')
    })

    test('should reject child name that is too long', () => {
      const invalidData = createInvalidEnrollmentData('childName', 'a'.repeat(101))
      expectValidationToFail(enrollmentSchema, invalidData, 'Name must be under 100 characters')
    })

    test('should accept valid child names', () => {
      const validNames = ['Jane Doe', 'Baby Smith', 'Little Johnny', 'Emma-Rose']
      validNames.forEach(name => {
        const data = createMockEnrollmentData({ childName: name })
        expectValidationToPass(enrollmentSchema, data)
      })
    })
  })

  describe('Child Age Validation', () => {
    test('should reject empty child age', () => {
      const invalidData = createInvalidEnrollmentData('childAge', '')
      expectValidationToFail(enrollmentSchema, invalidData, 'Child\'s age is required')
    })

    test('should reject child age that is too long', () => {
      const invalidData = createInvalidEnrollmentData('childAge', 'a'.repeat(21))
      expectValidationToFail(enrollmentSchema, invalidData, 'Age description is too long')
    })

    test('should accept valid age descriptions', () => {
      const validAges = ['3 years', '2.5 years', '18 months', '3 years 2 months']
      validAges.forEach(age => {
        const data = createMockEnrollmentData({ childAge: age })
        expectValidationToPass(enrollmentSchema, data)
      })
    })
  })

  describe('Start Date Validation', () => {
    test('should reject empty start date', () => {
      const invalidData = createInvalidEnrollmentData('startDate', '')
      expectValidationToFail(enrollmentSchema, invalidData, 'Preferred start date is required')
    })

    test('should reject invalid date formats', () => {
      const invalidDates = [
        '2024/06/01',
        '06-01-2024', 
        'June 1, 2024'
      ]
      invalidDates.forEach(date => {
        const data = createInvalidEnrollmentData('startDate', date)
        const result = enrollmentSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    test('should accept valid date formats', () => {
      const validDates = ['2024-06-01', '2024-12-31', '2025-01-15']
      validDates.forEach(date => {
        const data = createMockEnrollmentData({ startDate: date })
        expectValidationToPass(enrollmentSchema, data)
      })
    })
  })

  describe('Phone Validation', () => {
    test('should reject empty phone number', () => {
      const invalidData = createInvalidEnrollmentData('phone', '')
      expectValidationToFail(enrollmentSchema, invalidData, 'Phone number is required')
    })

    test('should reject phone numbers that are too short', () => {
      const invalidData = createInvalidEnrollmentData('phone', '12345')
      expectValidationToFail(enrollmentSchema, invalidData, 'Phone number is too short')
    })

    test('should reject phone numbers that are too long', () => {
      const invalidData = createInvalidEnrollmentData('phone', '1'.repeat(21))
      expectValidationToFail(enrollmentSchema, invalidData, 'Phone number is too long')
    })

    test('should reject phone numbers with invalid characters', () => {
      const invalidPhones = [
        '555-123-4567 ext. 123',
        '(555) 123-4567 x123',
        '555.123.4567@'
      ]
      invalidPhones.forEach(phone => {
        const data = createInvalidEnrollmentData('phone', phone)
        const result = enrollmentSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    test('should accept valid phone number formats', () => {
      const validPhones = [
        '(555) 123-4567',
        '555-123-4567',
        '555.123.4567',
        '5551234567',
        '+1 (555) 123-4567',
        '1-555-123-4567'
      ]
      validPhones.forEach(phone => {
        const data = createMockEnrollmentData({ phone })
        expectValidationToPass(enrollmentSchema, data)
      })
    })
  })

  describe('Email Validation', () => {
    test('should reject empty email', () => {
      const invalidData = createInvalidEnrollmentData('email', '')
      expectValidationToFail(enrollmentSchema, invalidData, 'Email address is required')
    })

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain.',
        'user name@domain.com'
      ]
      invalidEmails.forEach(email => {
        const data = createInvalidEnrollmentData('email', email)
        expectValidationToFail(enrollmentSchema, data, 'Please enter a valid email address')
      })
    })

    test('should accept valid email formats', () => {
      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user123@sub.domain.com',
        'user.name123@domain.co.uk'
      ]
      validEmails.forEach(email => {
        const data = createMockEnrollmentData({ email })
        expectValidationToPass(enrollmentSchema, data)
      })
    })
  })

  describe('Message Validation', () => {
    test('should accept messages within limit', () => {
      const message = 'a'.repeat(1500)
      const data = createMockEnrollmentData({ message })
      expectValidationToPass(enrollmentSchema, data)
    })

    test('should reject messages that are too long', () => {
      const message = 'a'.repeat(1501)
      const data = createInvalidEnrollmentData('message', message)
      expectValidationToFail(enrollmentSchema, data, 'Message must be under 1500 characters')
    })

    test('should transform undefined message to undefined', () => {
      const data = createMockEnrollmentData({ message: undefined })
      const result = enrollmentSchema.safeParse(data)
      expect(result.success).toBe(true)
      expect(result.data.message).toBeUndefined()
    })
  })

  describe('TypeScript Type Inference', () => {
    test('should correctly infer TypeScript type', () => {
      const validData = createMockEnrollmentData()
      const typedData: EnrollmentData = expectValidationToPass(enrollmentSchema, validData)
      expect(typedData.parentName).toBe(validData.parentName)
      expect(typedData.childName).toBe(validData.childName)
      expect(typedData.email).toBe(validData.email)
      }
    })
  })

  describe('Error Formatting', () => {
    test('should format field errors correctly', () => {
      const invalidData = createInvalidEnrollmentData('parentName', '')
      const result = enrollmentSchema.safeParse(invalidData)
      
      if (!result.success) {
        const formattedError = formatZodErrors(result.error)
        expect(formattedError).toContain('Parent/guardian name is required')
      }
    })

    test('should return generic error for unknown issues', () => {
      // Create a mock error with no field errors
      const mockError = {
        errors: [],
        flatten: () => ({
          fieldErrors: {},
          formErrors: []
        })
      } as any
      
      const formattedError = formatZodErrors(mockError)
      expect(formattedError).toBe('Please check your information and try again.')
    })

    test('should return first field error when multiple exist', () => {
      const invalidData = {
        ...createMockEnrollmentData(),
        parentName: '',
        childName: '',
        email: 'invalid'
      }
      const result = enrollmentSchema.safeParse(invalidData)
      
      if (!result.success) {
        const formattedError = formatZodErrors(result.error)
        // Should return one of the field errors, not all of them
        expect(formattedError).toMatch(/(Parent\/guardian name is required|Child's name is required|Please enter a valid email address)/)
      }
    })
  })
})
