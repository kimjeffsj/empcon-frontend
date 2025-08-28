'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { type PositionResponse } from '@/store/api/positionsApi'
import { type DepartmentResponse } from '@/store/api/departmentsApi'

interface PositionFormProps {
  position?: PositionResponse | null
  departments: DepartmentResponse[]
  onSubmit: (data: { title: string; departmentId: string; description?: string }) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PositionForm({ position, departments, onSubmit, onCancel, isLoading = false }: PositionFormProps) {
  const [title, setTitle] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ title?: string; departmentId?: string; description?: string }>({})

  // Initialize form with position data when editing
  useEffect(() => {
    if (position) {
      setTitle(position.title)
      setDepartmentId(position.departmentId)
      setDescription(position.description || '')
    } else {
      setTitle('')
      setDepartmentId('')
      setDescription('')
    }
    setErrors({})
  }, [position])

  const validateForm = () => {
    const newErrors: { title?: string; departmentId?: string; description?: string } = {}

    if (!title.trim()) {
      newErrors.title = 'Position title is required'
    } else if (title.length > 100) {
      newErrors.title = 'Position title must be less than 100 characters'
    }

    if (!departmentId) {
      newErrors.departmentId = 'Department selection is required'
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
      title: title.trim(),
      departmentId,
      description: description.trim() || undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pos-title">Position Title *</Label>
        <Input
          id="pos-title"
          type="text"
          placeholder="e.g., Senior Software Engineer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pos-dept">Department *</Label>
        <Select value={departmentId} onValueChange={setDepartmentId} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.departmentId && (
          <p className="text-sm text-red-600">{errors.departmentId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pos-desc">Job Description</Label>
        <Textarea
          id="pos-desc"
          placeholder="Detailed job description and responsibilities (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={4}
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
            ? (position ? 'Updating...' : 'Creating...')
            : (position ? 'Update Position' : 'Create Position')
          }
        </Button>
      </div>
    </form>
  )
}