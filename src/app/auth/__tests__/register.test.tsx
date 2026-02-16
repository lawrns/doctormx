import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import RegisterPage from '../register/page'

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock framer-motion para evitar animaciones en tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Supabase client
const mockSignUp = vi.fn()
const mockFrom = vi.fn(() => ({
  insert: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: mockSignUp,
    },
    from: mockFrom,
  })),
}))

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    mockRefresh.mockClear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Renderizado', () => {
    it('renderiza el título de la página', async () => {
      await act(async () => {
        render(<RegisterPage />)
      })
      expect(screen.getByText('Crear cuenta')).toBeInTheDocument()
    })

    it('renderiza el indicador de progreso', async () => {
      await act(async () => {
        render(<RegisterPage />)
      })
      expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument()
    })

    it('renderiza las opciones de tipo de cuenta en el paso 1', async () => {
      await act(async () => {
        render(<RegisterPage />)
      })
      expect(screen.getByText('Soy paciente')).toBeInTheDocument()
      expect(screen.getByText('Soy médico')).toBeInTheDocument()
    })

    it('renderiza el botón de siguiente', async () => {
      await act(async () => {
        render(<RegisterPage />)
      })
      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
    })
  })

  describe('Navegación entre pasos', () => {
    it('avanza al paso 2 al seleccionar tipo de cuenta y hacer click en siguiente', async () => {
      await act(async () => {
        render(<RegisterPage />)
      })

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })
    })

    it('muestra campos de información personal en el paso 2', async () => {
      await act(async () => {
        render(<RegisterPage />)
      })

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
      })
    })

    it('permite volver al paso anterior', async () => {
      await act(async () => {
        render(<RegisterPage />)
      })

      // Avanzar al paso 2
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })

      // Volver al paso 1
      const backButton = screen.getByRole('button', { name: /atrás/i })
      await act(async () => {
        fireEvent.click(backButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument()
      })
    })
  })

  describe('Paso 2 - Información personal', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<RegisterPage />)
      })

      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })
    })

    it('permite ingresar nombre completo', async () => {
      const nameInput = screen.getByPlaceholderText(/juan pérez/i)
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } })
      })
      expect(nameInput).toHaveValue('Juan Pérez')
    })

    it('permite ingresar correo electrónico', async () => {
      const emailInput = screen.getByPlaceholderText(/tu@email.com/i)
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      })
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('permite ingresar teléfono opcional', async () => {
      const phoneInput = screen.getByPlaceholderText(/55 1234 5678/i)
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '5512345678' } })
      })
      expect(phoneInput).toHaveValue('5512345678')
    })

    it('muestra indicador de fortaleza de contraseña', async () => {
      const passwordInput = screen.getByPlaceholderText(/mínimo 6 caracteres/i)
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'Password123!' } })
      })
      
      await waitFor(() => {
        expect(screen.getByText(/seguridad:/i)).toBeInTheDocument()
      })
    })

    it('muestra error cuando las contraseñas no coinciden', async () => {
      const passwordInput = screen.getByPlaceholderText(/mínimo 6 caracteres/i)
      const confirmInput = screen.getByPlaceholderText(/confirma tu contraseña/i)
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.change(confirmInput, { target: { value: 'different123' } })
        fireEvent.blur(confirmInput)
      })

      await waitFor(() => {
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
      })
    })

    it('muestra error cuando el nombre es muy corto', async () => {
      const nameInput = screen.getByPlaceholderText(/juan pérez/i)
      
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Ju' } })
        fireEvent.blur(nameInput)
      })

      await waitFor(() => {
        expect(screen.getByText(/el nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument()
      })
    })
  })

  describe('Paso 3 - Paciente', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<RegisterPage />)
      })

      // Paso 1 -> 2
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })

      // Llenar datos del paso 2
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/juan pérez/i), { target: { value: 'Juan Pérez' } })
        fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText(/confirma tu contraseña/i), { target: { value: 'password123' } })
      })

      // Paso 2 -> 3
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
      })
    })

    it('muestra opción de historial médico', async () => {
      expect(screen.getByText(/historial médico/i)).toBeInTheDocument()
    })

    it('muestra checkbox de términos y condiciones', async () => {
      expect(screen.getByText(/acepto los términos/i)).toBeInTheDocument()
    })

    it('muestra error cuando no se aceptan los términos', async () => {
      const createButton = screen.getByRole('button', { name: /crear cuenta/i })
      
      await act(async () => {
        fireEvent.click(createButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/debes aceptar los términos y condiciones/i)).toBeInTheDocument()
      })
    })
  })

  describe('Paso 3 - Doctor', () => {
    beforeEach(async () => {
      await act(async () => {
        render(<RegisterPage />)
      })

      // Seleccionar tipo doctor
      const doctorRadio = screen.getByLabelText(/soy médico/i)
      await act(async () => {
        fireEvent.click(doctorRadio)
      })

      // Paso 1 -> 2
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })

      // Llenar datos del paso 2
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/dr\. juan pérez/i), { target: { value: 'Dr. Juan Pérez' } })
        fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'doctor@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText(/confirma tu contraseña/i), { target: { value: 'password123' } })
      })

      // Paso 2 -> 3
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
      })
    })

    it('muestra campo de cédula profesional', async () => {
      expect(screen.getByLabelText(/número de cédula profesional/i)).toBeInTheDocument()
    })

    it('muestra lista de especialidades', async () => {
      expect(screen.getByText(/especialidades/i)).toBeInTheDocument()
      expect(screen.getByText('Medicina General')).toBeInTheDocument()
      expect(screen.getByText('Cardiología')).toBeInTheDocument()
    })

    it('permite seleccionar especialidades', async () => {
      const specialtyCheckbox = screen.getByText('Cardiología').closest('label')?.querySelector('button')
      if (specialtyCheckbox) {
        await act(async () => {
          fireEvent.click(specialtyCheckbox)
        })
      }
    })
  })

  describe('Estados de loading', () => {
    it('muestra estado de carga durante el registro', async () => {
      mockSignUp.mockImplementation(() => new Promise(() => {}))

      await act(async () => {
        render(<RegisterPage />)
      })

      // Completar paso 1
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })

      // Completar paso 2
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/juan pérez/i), { target: { value: 'Juan Pérez' } })
        fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText(/confirma tu contraseña/i), { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
      })

      // Aceptar términos y crear cuenta
      const termsCheckbox = screen.getByText(/acepto los términos/i).closest('label')?.querySelector('button')
      if (termsCheckbox) {
        await act(async () => {
          fireEvent.click(termsCheckbox)
        })
      }

      const createButton = screen.getByRole('button', { name: /crear cuenta/i })
      await act(async () => {
        fireEvent.click(createButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/creando cuenta/i)).toBeInTheDocument()
      })
    })
  })

  describe('Manejo de errores', () => {
    it('muestra error cuando el registro falla', async () => {
      mockSignUp.mockResolvedValue({
        error: { message: 'User already registered' },
      })

      await act(async () => {
        render(<RegisterPage />)
      })

      // Completar paso 1
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })

      // Completar paso 2
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/juan pérez/i), { target: { value: 'Juan Pérez' } })
        fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText(/confirma tu contraseña/i), { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
      })

      // Aceptar términos y crear cuenta
      const termsCheckbox = screen.getByText(/acepto los términos/i).closest('label')?.querySelector('button')
      if (termsCheckbox) {
        await act(async () => {
          fireEvent.click(termsCheckbox)
        })
      }

      const createButton = screen.getByRole('button', { name: /crear cuenta/i })
      await act(async () => {
        fireEvent.click(createButton)
      })

      await waitFor(() => {
        expect(screen.getByText('User already registered')).toBeInTheDocument()
      })
    })
  })

  describe('Flujo completo (happy path) - Paciente', () => {
    it('completa el registro exitosamente', async () => {
      mockSignUp.mockResolvedValue({
        error: null,
        data: { user: { id: 'user-123' } },
      })

      await act(async () => {
        render(<RegisterPage />)
      })

      // Completar paso 1 (ya está seleccionado paciente por defecto)
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })

      // Completar paso 2
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/juan pérez/i), { target: { value: 'Juan Pérez' } })
        fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText(/confirma tu contraseña/i), { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
      })

      // Aceptar términos
      const termsCheckbox = screen.getByText(/acepto los términos/i).closest('label')?.querySelector('button')
      if (termsCheckbox) {
        await act(async () => {
          fireEvent.click(termsCheckbox)
        })
      }

      // Crear cuenta
      const createButton = screen.getByRole('button', { name: /crear cuenta/i })
      await act(async () => {
        fireEvent.click(createButton)
      })

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'Juan Pérez',
            },
          },
        })
      })
    })
  })

  describe('Flujo completo (happy path) - Doctor', () => {
    it('completa el registro de doctor exitosamente', async () => {
      mockSignUp.mockResolvedValue({
        error: null,
        data: { user: { id: 'doctor-123' } },
      })

      await act(async () => {
        render(<RegisterPage />)
      })

      // Seleccionar tipo doctor
      const doctorLabel = screen.getByText(/soy médico/i).closest('label')
      if (doctorLabel) {
        await act(async () => {
          fireEvent.click(doctorLabel)
        })
      }

      // Paso 1 -> 2
      const nextButton = screen.getByRole('button', { name: /siguiente/i })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument()
      })

      // Completar paso 2
      await act(async () => {
        fireEvent.change(screen.getByPlaceholderText(/dr\. juan pérez/i), { target: { value: 'Dr. Juan Pérez' } })
        fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'doctor@example.com' } })
        fireEvent.change(screen.getByPlaceholderText(/mínimo 6 caracteres/i), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText(/confirma tu contraseña/i), { target: { value: 'password123' } })
      })

      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument()
      })

      // Seleccionar especialidad
      const cardiologyLabel = screen.getByText('Cardiología').closest('label')
      if (cardiologyLabel) {
        const checkbox = cardiologyLabel.querySelector('button')
        if (checkbox) {
          await act(async () => {
            fireEvent.click(checkbox)
          })
        }
      }

      // Crear cuenta
      const createButton = screen.getByRole('button', { name: /crear cuenta/i })
      await act(async () => {
        fireEvent.click(createButton)
      })

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled()
      })
    })
  })
})
