import PropTypes from 'prop-types';
import NavbarSelectProfile from "@/components/NavbarSelectProfile";

export default function SelectProfileLayout({ children }) {
 return (
   <div className="h-screen flex flex-col">
     <NavbarSelectProfile />
     <main className="flex-1 bg-gradient-to-br from-sky-50 via-sky-50 to-sky-50 overflow-hidden shadow-xl">
       {children}
     </main>
   </div>
 );
}

SelectProfileLayout.propTypes = {
 children: PropTypes.node.isRequired
};