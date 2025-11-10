import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/login?mode=signup',
      permanent: false,
    },
  };
};

export default function SignupRedirect() {
  return null;
}
