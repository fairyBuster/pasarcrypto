// chat-cs — the account's live support thread.
// The Figma frame put this thread in a sheet over the recovery form; on its own
// route the sheet would leave a password form dimmed in the background, so the
// screen now renders the conversation full-page instead.
import { useLocation, useNavigate } from 'react-router-dom';
import SupportChat from '../../components/SupportChat.jsx';

export default function ChatCs() {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // a screen opened straight from a URL has no in-app history to pop back to
    if (location.key === 'default') navigate('/akun');
    else navigate(-1);
  };

  return <SupportChat variant="page" onBack={goBack} />;
}
