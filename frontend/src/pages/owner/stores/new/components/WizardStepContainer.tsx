import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import type { WizardStep } from '../../../../../types/storeRegistration'

interface WizardStepContainerProps {
    currentStep: WizardStep
    direction: number
    children: ReactNode
}

/**
 * Wizard Step Container
 *
 * Wraps each wizard step with Framer Motion animations.
 * Provides smooth horizontal slide transitions between steps.
 */

const stepVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? '-100%' : '100%',
        opacity: 0,
    }),
}

export default function WizardStepContainer({
    currentStep,
    direction,
    children,
}: WizardStepContainerProps) {
    return (
        <AnimatePresence mode="wait" custom={direction}>
            <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                }}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
