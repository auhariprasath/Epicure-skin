import { LogOut, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export function Header() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setOpen(false)
  }

  const isDoctor = user?.role === 'doctor'
  const isPatient = user?.role === 'patient'

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div 
          className="text-xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => navigate(isDoctor ? "/doctor/dashboard" : "/")}
        >
          SkinCheck
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {isPatient && (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/prediction")}>
                Prediction
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/doctors")}>
                Doctors
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/appointments")}>
                Appointments
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/messages")}>
                Messages
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                Reports
              </Button>
            </>
          )}
          {isDoctor && (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/appointments")}>
                Appointments
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/forum")}>
                Forum
              </Button>
            </>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isPatient && (
                <>
                    <DropdownMenuItem onClick={() => handleNavigation("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/prediction")}>
                    Prediction
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/doctors")}>
                    Doctors
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/appointments")}>
                    Appointments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/messages")}>
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/reports")}>
                    Reports
                  </DropdownMenuItem>
                </>
              )}
              {isDoctor && (
                <>
                  <DropdownMenuItem onClick={() => handleNavigation("/doctor/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/doctor/appointments")}>
                    Appointments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNavigation("/doctor/forum")}>
                    Forum
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}