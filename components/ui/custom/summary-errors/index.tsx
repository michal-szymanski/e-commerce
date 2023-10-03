import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

type Props = {
    errors: { id: string; message: string }[];
};

const SummaryErrors = ({ errors }: Props) => (
    <Alert className="w-[400px] text-destructive">
        <ExclamationCircleIcon className="h-5 w-5 !text-destructive" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
            {errors.map((e) => (
                <p key={e.id} className="text-sm font-medium">
                    {e.message}
                </p>
            ))}
        </AlertDescription>
    </Alert>
);

export default SummaryErrors;
