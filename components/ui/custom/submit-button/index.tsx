import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Spinner } from '@nextui-org/react';
import { AnimatePresence, motion } from 'framer-motion';

type Props = {
    isLoading: boolean;
    isSuccess: boolean;
    onComplete: () => void;
};

const SubmitButton = ({ isLoading, isSuccess, onComplete }: Props) => {
    const renderContent = () => {
        if (isSuccess)
            return (
                <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onAnimationComplete={onComplete}
                    className="flex h-full w-full items-center justify-center"
                >
                    <CheckIcon className="h-5 w-5 text-white" />
                </motion.div>
            );
        if (isLoading)
            return (
                <motion.div
                    key="spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full w-full items-center justify-center"
                >
                    <Spinner size="sm" classNames={{ base: 'opacity-100', circle1: 'border-b-[white]', circle2: 'border-b-[white]' }} />
                </motion.div>
            );

        return (
            <motion.div key="submit" initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full w-full items-center justify-center">
                Submit
            </motion.div>
        );
    };

    return (
        <Button
            type="submit"
            className={cn('w-full', {
                'bg-green-400 hover:bg-green-400': isSuccess
            })}
            disabled={isLoading || isSuccess}
        >
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        </Button>
    );
};

export default SubmitButton;
