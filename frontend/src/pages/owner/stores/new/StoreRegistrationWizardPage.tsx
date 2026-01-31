import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import OwnerLayout from '../../../../components/layout/OwnerLayout'
import WizardProgressBar from './components/WizardProgressBar'
import WizardStepContainer from './components/WizardStepContainer'
import Step1BasicInfo from './components/Step1BasicInfo'
import Step2Location from './components/Step2Location'
import Step3StampSetup from './components/Step3StampSetup'
import MobilePreview from './components/MobilePreview'
import { useCreateStore } from '../../../../hooks/useCreateStore'
import {
    storeRegistrationSchema,
    type StoreRegistrationFormData,
} from './schemas/storeRegistrationSchema'
import type { WizardStep } from '../../../../types/storeRegistration'

/**
 * Store Registration Wizard Page
 *
 * 3-step wizard for onboarding new stores:
 * 1. Basic Info (name, category, logo)
 * 2. Location & Contact (address, phone)
 * 3. Stamp & Reward Setup
 *
 * Features:
 * - Progressive validation per step
 * - Smooth Framer Motion animations
 * - Confetti on success
 * - Exit confirmation
 */

export default function StoreRegistrationWizardPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState<WizardStep>(1)
    const [direction, setDirection] = useState(0)

    const createStoreMutation = useCreateStore()

    // Form setup with Zod validation
    const form = useForm<StoreRegistrationFormData>({
        resolver: zodResolver(storeRegistrationSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            category: undefined,
            logoFile: undefined,
            address: '',
            phone: '',
            stampCardName: '',
            maxStamps: 10,
            rewardDescription: '',
            termsAgreed: false,
        },
    })

    const { handleSubmit, trigger, watch } = form

    // Watch fields for step validation
    const formValues = watch()

    // Validate current step
    const validateCurrentStep = async (): Promise<boolean> => {
        let isValid = false

        switch (currentStep) {
            case 1:
                isValid = await trigger(['name', 'category'])
                break
            case 2:
                isValid = await trigger(['address', 'phone'])
                // Step 2 is optional, so always pass if no errors
                isValid = true
                break
            case 3:
                isValid = await trigger([
                    'stampCardName',
                    'maxStamps',
                    'rewardDescription',
                    'termsAgreed',
                ])
                break
        }

        return isValid
    }

    // Check if current step can proceed
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1:
                return Boolean(formValues.name && formValues.category)
            case 2:
                return true // Optional fields
            case 3:
                return Boolean(
                    formValues.stampCardName &&
                        formValues.maxStamps &&
                        formValues.rewardDescription &&
                        formValues.termsAgreed
                )
            default:
                return false
        }
    }

    // Navigation handlers
    const handleNext = async () => {
        const isValid = await validateCurrentStep()
        if (!isValid || !canProceed()) return

        if (currentStep < 3) {
            setDirection(1)
            setCurrentStep((prev) => (prev + 1) as WizardStep)
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1)
            setCurrentStep((prev) => (prev - 1) as WizardStep)
        }
    }

    // Form submission
    const onSubmit = async (data: StoreRegistrationFormData) => {
        try {
            // Extract API-compatible fields
            const storePayload = {
                name: data.name,
                address: data.address || undefined,
                phone: data.phone || undefined,
                status: 'ACTIVE' as const,
            }

            // Create store
            await createStoreMutation.mutateAsync(storePayload)

            // Trigger confetti
            triggerConfetti()

            // Wait a bit for confetti, then navigate
            setTimeout(() => {
                navigate('/owner/stores')
            }, 1500)
        } catch (error) {
            console.error('Failed to create store:', error)
        }
    }

    // Confetti animation
    const triggerConfetti = () => {
        const count = 200
        const defaults = {
            origin: { y: 0.7 },
            colors: ['#ff4d00', '#ffd600', '#2e58ff'],
        }

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            })
        }

        fire(0.25, { spread: 26, startVelocity: 55 })
        fire(0.2, { spread: 60 })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
        fire(0.1, { spread: 120, startVelocity: 45 })
    }

    // Exit confirmation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (formValues.name) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [formValues.name])

    // Focus management
    useEffect(() => {
        // Focus first input when step changes
        const firstInput = document.querySelector(
            'input:not([type="radio"]):not([type="checkbox"]), textarea'
        ) as HTMLElement
        firstInput?.focus()
    }, [currentStep])

    return (
        <OwnerLayout>
            <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <WizardProgressBar currentStep={currentStep} />
                </div>

                {/* Two Column Layout */}
                <div className="flex gap-8">
                    {/* Left Column: Form */}
                    <div className="flex-1 lg:max-w-2xl">
                        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                            {/* Step Content */}
                            <div className="relative mb-8 min-h-[500px] overflow-hidden">
                                <WizardStepContainer
                                    currentStep={currentStep}
                                    direction={direction}
                                >
                                    {currentStep === 1 && <Step1BasicInfo form={form} />}
                                    {currentStep === 2 && <Step2Location form={form} />}
                                    {currentStep === 3 && <Step3StampSetup form={form} />}
                                </WizardStepContainer>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between gap-4">
                                {/* Back Button */}
                                <Button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={currentStep === 1}
                                    variant="ghost"
                                    size="md"
                                    leftIcon={<ArrowLeft className="h-5 w-5" />}
                                >
                                    이전
                                </Button>

                                {/* Next/Submit Button */}
                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!canProceed()}
                                        variant="secondary"
                                        size="md"
                                        rightIcon={<ArrowRight className="h-5 w-5" />}
                                    >
                                        다음
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={
                                            !canProceed() || createStoreMutation.isPending
                                        }
                                        variant="secondary"
                                        size="md"
                                        isLoading={createStoreMutation.isPending}
                                    >
                                        매장 등록 완료
                                    </Button>
                                )}
                            </div>

                            {/* Error Message */}
                            {createStoreMutation.isError && (
                                <div className="mt-4 rounded-xl bg-kkookk-red/10 p-4">
                                    <p className="text-sm text-kkookk-red">
                                        매장 등록에 실패했습니다. 다시 시도해주세요.
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Right Column: Mobile Preview (Desktop Only) */}
                    <div className="hidden lg:block lg:w-80">
                        <MobilePreview formData={formValues} />
                    </div>
                </div>
            </div>
        </OwnerLayout>
    )
}
