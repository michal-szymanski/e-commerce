import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/20/solid';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    isLoading: boolean;
    isSuccess: boolean;
    onAnimationComplete: () => void;
};

const SubmitButton = ({ isLoading, isSuccess, onAnimationComplete }: Props) => {
    const [isSpinner, setIsSpinner] = useState(false);
    const [isSpinnerComplete, setIsSpinnerComplete] = useState(false);

    useEffect(() => {
        if (!isLoading) return;
        setIsSpinner(true);
    }, [isLoading]);

    useEffect(() => {
        if (!isSpinner) return;
        const id = setTimeout(() => {
            setIsSpinnerComplete(true);
        }, 2000);
        return () => {
            clearTimeout(id);
        };
    }, [isSpinner]);

    const renderContent = () => {
        if (isSuccess && isSpinnerComplete)
            return (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onAnimationComplete={onAnimationComplete}>
                    <CheckIcon className="h-5 w-5 text-white" />
                </motion.div>
            );
        if (isSpinner)
            return (
                <motion.div
                    key="spinner"
                    variants={{
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
                    }}
                    initial="hidden"
                    animate={['visible', 'spin']}
                    exit="hidden"
                >
                    <Loader2 />
                </motion.div>
            );

        return (
            <motion.div key="submit" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Submit
            </motion.div>
        );
    };

    return (
        <Button
            type="submit"
            className={cn('w-full disabled:opacity-100', {
                'bg-green-500 hover:bg-green-500': isSuccess && isSpinnerComplete
            })}
            disabled={isSpinner || isSuccess}
        >
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        </Button>
    );
};

export default SubmitButton;
