/**
 * AI-Powered Self-Healing Test Infrastructure
 * Intelligent locators, automatic test repair, and visual validation
 */

import { Page, Locator, ElementHandle } from '@playwright/test'
import { createHash } from 'crypto'

export interface ElementSignature {
  text?: string
  attributes: Record<string, string>
  cssClasses: string[]
  tagName: string
  xpath: string
  cssSelector: string
  textContent?: string
  ariaLabel?: string
  ariaRole?: string
  placeholder?: string
  title?: string
  value?: string
  href?: string
  src?: string
  alt?: string
  dataTestId?: string
}

export interface LocatorStrategy {
  name: string
  priority: number
  locator: string
  type: 'css' | 'xpath' | 'text' | 'role' | 'testid' | 'aria'
  confidence: number
}

export interface HealingAttempt {
  originalLocator: string
  attemptedLocators: LocatorStrategy[]
  successfulLocator?: LocatorStrategy
  healingTime: number
  success: boolean
  error?: string
}

export interface VisualSignature {
  screenshot: string // base64 encoded
  boundingBox: { x: number; y: number; width: number; height: number }
  visualHash: string
  colors: string[]
  textRegions: Array<{ text: string; x: number; y: number; width: number; height: number }>
}

class SelfHealingManager {
  private elementSignatures: Map<string, ElementSignature> = new Map()
  private visualSignatures: Map<string, VisualSignature> = new Map()
  private healingHistory: Map<string, HealingAttempt[]> = new Map()
  private learningData: Map<string, LocatorStrategy[]> = new Map()
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Create an intelligent locator with self-healing capabilities
   */
  async createIntelligentLocator(
    selector: string,
    options: { timeout?: number; retry?: boolean } = {}
  ): Promise<Locator> {
    const { timeout = 5000, retry = true } = options

    try {
      // First try the original selector
      const locator = this.page.locator(selector)
      await locator.first().waitFor({ timeout })
      return locator
    } catch (error) {
      if (!retry) throw error

      // Attempt to heal the locator
      const healedLocator = await this.healLocator(selector, timeout)
      if (healedLocator) {
        return healedLocator
      }

      throw new Error(`Failed to locate element with selector: ${selector}`)
    }
  }

  /**
   * Attempt to heal a failed locator
   */
  private async healLocator(originalSelector: string, timeout: number): Promise<Locator | null> {
    const startTime = Date.now()
    const attempt: HealingAttempt = {
      originalLocator: originalSelector,
      attemptedLocators: [],
      healingTime: 0,
      success: false
    }

    try {
      // Get element signature from cache or create new one
      const signature = await this.getElementSignature(originalSelector)
      
      // Generate alternative locator strategies
      const strategies = await this.generateLocatorStrategies(signature)
      attempt.attemptedLocators = strategies

      // Try each strategy
      for (const strategy of strategies) {
        try {
          const locator = this.page.locator(strategy.locator)
          await locator.first().waitFor({ timeout: Math.min(timeout / strategies.length, 2000) })
          
          // Verify this is the right element
          const isValid = await this.validateElementMatch(signature, locator)
          
          if (isValid) {
            attempt.successfulLocator = strategy
            attempt.success = true
            attempt.healingTime = Date.now() - startTime

            // Record successful healing
            this.recordHealingAttempt(originalSelector, attempt)
            this.updateLearningData(originalSelector, strategy)

            console.log(`Successfully healed locator: ${originalSelector} -> ${strategy.locator}`)
            return locator
          }
        } catch (error) {
          // Strategy failed, try next one
          continue
        }
      }

      attempt.healingTime = Date.now() - startTime
      this.recordHealingAttempt(originalSelector, attempt)
      
      return null
    } catch (error) {
      attempt.error = error instanceof Error ? error.message : String(error)
      attempt.healingTime = Date.now() - startTime
      this.recordHealingAttempt(originalSelector, attempt)
      
      return null
    }
  }

  /**
   * Get element signature for healing
   */
  private async getElementSignature(selector: string): Promise<ElementSignature> {
    // Check cache first
    const cached = this.elementSignatures.get(selector)
    if (cached) return cached

    try {
      // Try to get element using multiple strategies
      const element = await this.findElementWithMultipleStrategies(selector)
      if (!element) {
        throw new Error(`Cannot find element for signature: ${selector}`)
      }

      const signature = await this.extractElementSignature(element)
      this.elementSignatures.set(selector, signature)
      
      return signature
    } catch (error) {
      // Create minimal signature for healing
      return this.createMinimalSignature(selector)
    }
  }

  private async findElementWithMultipleStrategies(selector: string): Promise<ElementHandle | null> {
    const strategies = [
      { type: 'css' as const, locator: selector },
      { type: 'xpath' as const, locator: `//*[@data-testid="${selector.replace(/[^a-zA-Z0-9]/g, '')}"]` },
      { type: 'text' as const, locator: `text=${selector}` },
      { type: 'role' as const, locator: `role=button[name="${selector}"]` },
      { type: 'aria' as const, locator: `[aria-label="${selector}"]` }
    ]

    for (const strategy of strategies) {
      try {
        const locator = this.page.locator(strategy.locator)
        const element = await locator.first().elementHandle()
        if (element) return element
      } catch (error) {
        continue
      }
    }

    return null
  }

  private async extractElementSignature(element: ElementHandle): Promise<ElementSignature> {
    const properties = await element.evaluate((el: HTMLElement) => {
      const attrs: Record<string, string> = {}
      const attributeNames = Array.from(el.attributes)
      for (const attr of attributeNames) {
        attrs[attr.name] = attr.value || ''
      }

      return {
        tagName: el.tagName.toLowerCase(),
        textContent: el.textContent?.trim() || undefined,
        attributes: attrs,
        cssClasses: Array.from(el.classList),
        ariaLabel: el.getAttribute('aria-label') || undefined,
        ariaRole: el.getAttribute('role') || undefined,
        placeholder: (el as HTMLInputElement).placeholder || undefined,
        title: el.title || undefined,
        value: (el as HTMLInputElement).value || undefined,
        href: (el as HTMLAnchorElement).href || undefined,
        src: (el as HTMLImageElement).src || undefined,
        alt: (el as HTMLImageElement).alt || undefined,
        dataTestId: el.getAttribute('data-testid') || undefined
      }
    })

    const rect = await element.boundingBox()
    const xpath = await this.generateXPath(element)
    const cssSelector = await this.generateCSSSelector(element)

    return {
      ...properties,
      xpath,
      cssSelector,
      text: properties.textContent
    }
  }

  private createMinimalSignature(selector: string): ElementSignature {
    // Extract information from selector itself
    const testIdMatch = selector.match(/data-testid=['"]([^'"]+)['"]/)
    const ariaLabelMatch = selector.match(/aria-label=['"]([^'"]+)['"]/)
    const textMatch = selector.match(/text=['"]([^'"]+)['"]/)
    const roleMatch = selector.match(/role=['"]([^'"]+)['"]/)

    return {
      tagName: 'unknown',
      attributes: {},
      cssClasses: [],
      xpath: selector,
      cssSelector: selector,
      text: textMatch?.[1],
      ariaLabel: ariaLabelMatch?.[1],
      ariaRole: roleMatch?.[1],
      dataTestId: testIdMatch?.[1]
    }
  }

  private async generateXPath(element: ElementHandle): Promise<string> {
    return await element.evaluate((el) => {
      const getXPath = (node: Element): string => {
        if (node.id) {
          return `//*[@id="${node.id}"]`
        }
        
        if (node === document.body) {
          return '/html/body'
        }

        const ix = Array.from(node.parentNode?.children || [])
          .filter(child => child.tagName === node.tagName)
          .indexOf(node)

        return `${getXPath(node.parentNode as Element)}/${node.tagName.toLowerCase()}[${ix + 1}]`
      }

      return getXPath(el as Element)
    })
  }

  private async generateCSSSelector(element: ElementHandle): Promise<string> {
    return await element.evaluate((el) => {
      const getCSSSelector = (node: Element): string => {
        if (node.id) {
          return `#${node.id}`
        }

        const path = []
        while (node && node.nodeType === Node.ELEMENT_NODE) {
          let selector = node.nodeName.toLowerCase()
          
          if (node.id) {
            selector += `#${node.id}`
            path.unshift(selector)
            break
          } else {
            let sibling = node.previousElementSibling
            let nth = 1
            while (sibling) {
              if (sibling.nodeName.toLowerCase() === selector) {
                nth++
              }
              sibling = sibling.previousElementSibling
            }
            
            if (nth !== 1) {
              selector += `:nth-of-type(${nth})`
            }
          }
          
          path.unshift(selector)
          node = node.parentNode as Element
        }

        return path.join(' > ')
      }

      return getCSSSelector(el as Element)
    })
  }

  /**
   * Generate alternative locator strategies based on element signature
   */
  private async generateLocatorStrategies(signature: ElementSignature): Promise<LocatorStrategy[]> {
    const strategies: LocatorStrategy[] = []

    // Priority 1: Test ID (most stable)
    if (signature.dataTestId) {
      strategies.push({
        name: 'test-id',
        priority: 1,
        locator: `[data-testid="${signature.dataTestId}"]`,
        type: 'testid',
        confidence: 0.95
      })
    }

    // Priority 2: ARIA attributes
    if (signature.ariaLabel) {
      strategies.push({
        name: 'aria-label',
        priority: 2,
        locator: `[aria-label="${signature.ariaLabel}"]`,
        type: 'aria',
        confidence: 0.9
      })
    }

    if (signature.ariaRole) {
      strategies.push({
        name: 'aria-role',
        priority: 3,
        locator: `[role="${signature.ariaRole}"]`,
        type: 'role',
        confidence: 0.8
      })
    }

    // Priority 3: Text content
    if (signature.text && signature.text.length > 0 && signature.text.length < 50) {
      strategies.push({
        name: 'text-content',
        priority: 4,
        locator: `text=${signature.text}`,
        type: 'text',
        confidence: 0.85
      })
    }

    // Priority 4: Placeholder
    if (signature.placeholder) {
      strategies.push({
        name: 'placeholder',
        priority: 5,
        locator: `[placeholder="${signature.placeholder}"]`,
        type: 'css',
        confidence: 0.8
      })
    }

    // Priority 5: CSS classes
    if (signature.cssClasses.length > 0) {
      const uniqueClasses = signature.cssClasses.filter(cls => 
        cls.length > 3 && !cls.includes('hover') && !cls.includes('active')
      )
      
      if (uniqueClasses.length > 0) {
        strategies.push({
          name: 'css-classes',
          priority: 6,
          locator: `.${uniqueClasses.join('.')}`,
          type: 'css',
          confidence: 0.7
        })
      }
    }

    // Priority 6: Tag name with attributes
    const attrs = Object.entries(signature.attributes)
      .filter(([key, value]) => 
        key !== 'class' && key !== 'style' && value && value.length < 50
      )
      .slice(0, 2) // Limit to 2 most important attributes

    if (attrs.length > 0) {
      const attrSelector = attrs.map(([key, value]) => `[${key}="${value}"]`).join('')
      strategies.push({
        name: 'attributes',
        priority: 7,
        locator: `${signature.tagName}${attrSelector}`,
        type: 'css',
        confidence: 0.6
      })
    }

    // Priority 7: XPath (fallback)
    strategies.push({
      name: 'xpath',
      priority: 8,
      locator: signature.xpath,
      type: 'xpath',
      confidence: 0.5
    })

    // Sort by confidence and priority
    return strategies.sort((a, b) => {
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence
      }
      return a.priority - b.priority
    })
  }

  /**
   * Validate that located element matches the original signature
   */
  private async validateElementMatch(
    originalSignature: ElementSignature,
    locator: Locator
  ): Promise<boolean> {
    try {
      const element = await locator.first().elementHandle()
      if (!element) return false

      const currentSignature = await this.extractElementSignature(element)
      
      // Compare key properties
      const checks = [
        currentSignature.tagName === originalSignature.tagName,
        currentSignature.text === originalSignature.text,
        currentSignature.ariaLabel === originalSignature.ariaLabel,
        currentSignature.dataTestId === originalSignature.dataTestId
      ]

      // Check CSS class overlap
      const originalClasses = new Set(originalSignature.cssClasses)
      const currentClasses = new Set(currentSignature.cssClasses)
      const classOverlap = [...originalClasses].filter(cls => currentClasses.has(cls)).length
      const classSimilarity = originalClasses.size > 0 ? classOverlap / originalClasses.size : 1

      checks.push(classSimilarity >= 0.5)

      // At least 70% of checks should pass
      const passedChecks = checks.filter(check => check).length
      return passedChecks / checks.length >= 0.7
    } catch (error) {
      return false
    }
  }

  /**
   * Record healing attempt for learning
   */
  private recordHealingAttempt(selector: string, attempt: HealingAttempt): void {
    if (!this.healingHistory.has(selector)) {
      this.healingHistory.set(selector, [])
    }

    const history = this.healingHistory.get(selector)!
    history.push(attempt)

    // Keep only last 10 attempts
    if (history.length > 10) {
      history.shift()
    }
  }

  /**
   * Update learning data based on successful healing
   */
  private updateLearningData(selector: string, successfulStrategy: LocatorStrategy): void {
    if (!this.learningData.has(selector)) {
      this.learningData.set(selector, [])
    }

    const strategies = this.learningData.get(selector)!
    
    // Add or update successful strategy
    const existingIndex = strategies.findIndex(s => s.locator === successfulStrategy.locator)
    if (existingIndex >= 0) {
      strategies[existingIndex].confidence = Math.min(1, strategies[existingIndex].confidence + 0.1)
    } else {
      strategies.push({ ...successfulStrategy })
    }

    // Sort by confidence
    strategies.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Get healing statistics
   */
  getHealingStats(): {
    totalAttempts: number
    successfulHealings: number
    successRate: number
    averageHealingTime: number
    mostCommonStrategies: Array<{ strategy: string; count: number }>
  } {
    let totalAttempts = 0
    let successfulHealings = 0
    let totalHealingTime = 0
    const strategyCounts = new Map<string, number>()

    for (const attempts of this.healingHistory.values()) {
      for (const attempt of attempts) {
        totalAttempts++
        totalHealingTime += attempt.healingTime
        
        if (attempt.success) {
          successfulHealings++
          
          if (attempt.successfulLocator) {
            const strategyName = attempt.successfulLocator.name
            strategyCounts.set(strategyName, (strategyCounts.get(strategyName) || 0) + 1)
          }
        }
      }
    }

    const mostCommonStrategies = Array.from(strategyCounts.entries())
      .map(([strategy, count]) => ({ strategy, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalAttempts,
      successfulHealings,
      successRate: totalAttempts > 0 ? (successfulHealings / totalAttempts) * 100 : 0,
      averageHealingTime: totalAttempts > 0 ? totalHealingTime / totalAttempts : 0,
      mostCommonStrategies
    }
  }

  /**
   * Create visual signature for visual healing
   */
  async createVisualSignature(locator: Locator): Promise<VisualSignature> {
    const element = await locator.first()
    const boundingBox = await element.boundingBox()
    if (!boundingBox) {
      throw new Error('Cannot create visual signature: element not visible')
    }

    // Take screenshot of element
    const screenshot = await element.screenshot()
    
    // Generate visual hash
    const visualHash = this.generateVisualHash(screenshot.toString('base64'))

    // Extract colors and text regions
    const colors = await this.extractColors(element)
    const textRegions = await this.extractTextRegions(element)

    return {
      screenshot: screenshot.toString('base64'),
      boundingBox,
      visualHash,
      colors,
      textRegions
    }
  }

  private generateVisualHash(screenshot: string): string {
    const hash = createHash('md5')
    hash.update(screenshot)
    return hash.digest('hex')
  }

  private async extractColors(locator: Locator): Promise<string[]> {
    // Extract dominant colors from element
    // This is a simplified implementation
    return ['#ffffff', '#000000'] // Placeholder
  }

  private async extractTextRegions(locator: Locator): Promise<Array<{ text: string; x: number; y: number; width: number; height: number }>> {
    // Extract text regions within element
    // This is a simplified implementation
    return [] // Placeholder
  }

  /**
   * Visual healing using computer vision
   */
  async healVisually(originalSignature: VisualSignature): Promise<Locator | null> {
    // This would integrate with a computer vision service
    // For now, return null as placeholder
    return null
  }

  /**
   * Export learning data for persistence
   */
  exportLearningData(): {
    elementSignatures: Record<string, ElementSignature>
    healingHistory: Record<string, HealingAttempt[]>
    learningData: Record<string, LocatorStrategy[]>
  } {
    return {
      elementSignatures: Object.fromEntries(this.elementSignatures),
      healingHistory: Object.fromEntries(this.healingHistory),
      learningData: Object.fromEntries(this.learningData)
    }
  }

  /**
   * Import learning data
   */
  importLearningData(data: {
    elementSignatures: Record<string, ElementSignature>
    healingHistory: Record<string, HealingAttempt[]>
    learningData: Record<string, LocatorStrategy[]>
  }): void {
    this.elementSignatures = new Map(Object.entries(data.elementSignatures))
    this.healingHistory = new Map(Object.entries(data.healingHistory))
    this.learningData = new Map(Object.entries(data.learningData))
  }
}

/**
 * Enhanced Playwright locator with self-healing capabilities
 */
export class IntelligentLocator {
  private page: Page
  private healingManager: SelfHealingManager

  constructor(page: Page) {
    this.page = page
    this.healingManager = new SelfHealingManager(page)
  }

  async locator(selector: string, options?: { timeout?: number; retry?: boolean }): Promise<Locator> {
    return await this.healingManager.createIntelligentLocator(selector, options)
  }

  async getByTestId(testId: string, options?: { timeout?: number }): Promise<Locator> {
    return await this.locator(`[data-testid="${testId}"]`, options)
  }

  async getByLabel(label: string, options?: { timeout?: number }): Promise<Locator> {
    return await this.locator(`[aria-label="${label}"]`, options)
  }

  async getByRole(role: string, options?: { name?: string; timeout?: number }): Promise<Locator> {
    const selector = options?.name 
      ? `[role="${role}"][aria-label="${options.name}"]`
      : `[role="${role}"]`
    return await this.locator(selector, options)
  }

  async getByPlaceholder(placeholder: string, options?: { timeout?: number }): Promise<Locator> {
    return await this.locator(`[placeholder="${placeholder}"]`, options)
  }

  getHealingStats() {
    return this.healingManager.getHealingStats()
  }
}

export default SelfHealingManager
