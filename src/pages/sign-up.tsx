import AppFooter from "@/components/common/AppFooter";
import AppHeader from "@/components/common/AppHeader";
import SignUp from "@/components/sign/sign-up";

function SignUpPage1() {
  return (
    <div className="page">
      <AppHeader />
      <div className="container">
        <div className="w-full flex flex-col items-center justify-start p-4 gap-4 sm:p-6 sm:gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-[2px]"></div>
          </div>
          <SignUp />
        </div>
      </div>
      <AppFooter />
    </div>
  );
}

export default SignUpPage1;
