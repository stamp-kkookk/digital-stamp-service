import { motion } from 'framer-motion'
import type { WizardStep } from '../../../../../types/storeRegistration'

interface WizardProgressBarProps {
    currentStep: WizardStep
}

/**
 * Wizard Progress Bar
 *
 * Visual indicator of progress through the 3-step wizard.
 * Features smooth animations and clear step labels.
 */

export default function WizardProgressBar({ currentStep }: WizardProgressBarProps) {
    const steps = [
        { number: 1, label: '기본 정보' },
        { number: 2, label: '위치 & 연락처' },
        { number: 3, label: '스탬프 설정' },
    ]

    const progress = (currentStep / 3) * 100

    return (
        <div className="w-full" role="progressbar" aria-label={`진행 단계: ${currentStep} / 3`}>
            {/* Step Labels */}
            <div className="mb-4 flex justify-between">
                {steps.map((step) => (
                    <div
                        key={step.number}
                        className={`flex items-center gap-2 ${
                            step.number === currentStep
                                ? 'text-kkookk-indigo font-semibold'
                                : step.number < currentStep
                                  ? 'text-kkookk-navy'
                                  : 'text-kkookk-steel'
                        }`}
                    >
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                step.number === currentStep
                                    ? 'bg-kkookk-indigo text-white'
                                    : step.number < currentStep
                                      ? 'bg-kkookk-indigo/20 text-kkookk-indigo'
                                      : 'bg-gray-200 text-kkookk-steel'
                            }`}
                        >
                            {step.number}
                        </div>
                        <span className="hidden text-sm md:inline">{step.label}</span>
                    </div>
                ))}
            </div>

            {/* Progress Track */}
            <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                    className="absolute left-0 top-0 h-full rounded-full bg-kkookk-indigo"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}
