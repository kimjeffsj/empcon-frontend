'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { type DepartmentResponse } from '@/store/api/departmentsApi'

interface DepartmentFormProps {
  department?: DepartmentResponse | null
  onSubmit: (data: { name: string; description?: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function DepartmentForm({ department, onSubmit, onCancel, isLoading = false }: DepartmentFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({})

  // Initialize form with department data when editing
  useEffect(() => {
    if (department) {
      setName(department.name)
      setDescription(department.description || '')
    } else {
      setName('')
      setDescription('')
    }
    setErrors({})
  }, [department])

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {}

    if (!name.trim()) {
      newErrors.name = 'Department name is required'
    } else if (name.length > 100) {
      newErrors.name = 'Department name must be less than 100 characters'
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dept-name">Department Name *</Label>
        <Input
          id="dept-name"
          type="text"
          placeholder="e.g., Information Technology"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dept-desc">Description</Label>
        <Textarea
          id="dept-desc"
          placeholder="Brief description of the department (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading 
            ? (department ? 'Updating...' : 'Creating...')
            : (department ? 'Update Department' : 'Create Department')
          }
        </Button>
      </div>
    </form>
  )
}