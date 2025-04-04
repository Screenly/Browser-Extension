import { signOut } from '@/features/popup-slice';
import { AppDispatch } from '@/store';

export const handleSignOut = async (
  event: React.MouseEvent<HTMLButtonElement>,
  dispatch: AppDispatch,
  setIsLoading: (loading: boolean) => void,
): Promise<void> => {
  event.preventDefault();
  setIsLoading(true);
  dispatch(signOut());
  setIsLoading(false);
};
