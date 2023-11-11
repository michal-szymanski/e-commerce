import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { SubmitButtonState } from '@/components/ui/custom/submit-button/reducer';

type Props = {
    state: SubmitButtonState;
    onAnimationComplete: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const variants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    spin: {
        rotate: 360,
        transition: {
            duration: 0.5,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};

const SubmitButton = ({ state: { isLoading, isSuccess }, onAnimationComplete, className, ...buttonProps }: Props) => {
    const renderContent = () => {
        if (isSuccess)
            return (
                <motion.div key="success" variants={variants} initial="hidden" animate="visible" onAnimationComplete={onAnimationComplete} className="absolute">
                    <CheckIcon className="h-5 w-5 text-white" />
                </motion.div>
            );
        if (isLoading)
            return (
                <motion.div key="spinner" variants={variants} initial="hidden" animate={['visible', 'spin']} exit="hidden" className="absolute">
                    <Loader2 />
                </motion.div>
            );

        return (
            <motion.div key="submit" variants={variants} exit="hidden" className="absolute">
                Submit
            </motion.div>
        );
    };

    return (
        <Button
            type="submit"
            className={cn('relative w-full disabled:opacity-100', className, {
                'bg-green-500 hover:bg-green-500': isSuccess
            })}
            disabled={isLoading || isSuccess}
            {...buttonProps}
        >
            <AnimatePresence>{renderContent()}</AnimatePresence>
        </Button>
    );
};

export default SubmitButton;
