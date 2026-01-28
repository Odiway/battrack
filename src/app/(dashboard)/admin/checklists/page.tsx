'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Loader2, 
  ClipboardList,
  Edit,
  Trash2,
  X,
  GripVertical,
  Cpu
} from 'lucide-react'
import { toast } from 'sonner'
import { CircuitPattern, GlowLine } from '@/components/ui/tech-pattern'

interface Question {
  id?: string
  questionText: string
  questionType: 'YES_NO' | 'TEXT' | 'NUMBER'
  required: boolean
}

interface ChecklistTemplate {
  id: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
  questions: Array<{
    id: string
    questionText: string
    questionType: string
    required: boolean
    displayOrder: number
  }>
}

export default function ChecklistsPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null)
  const [viewingTemplate, setViewingTemplate] = useState<ChecklistTemplate | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/checklist-templates')
      const data = await res.json()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      toast.error('Failed to load checklist templates')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setDescription('')
    setQuestions([])
    setEditingTemplate(null)
  }

  function handleEdit(template: ChecklistTemplate) {
    setEditingTemplate(template)
    setName(template.name)
    setDescription(template.description || '')
    setQuestions(template.questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType as 'YES_NO' | 'TEXT' | 'NUMBER',
      required: q.required,
    })))
    setDialogOpen(true)
  }

  function handleView(template: ChecklistTemplate) {
    setViewingTemplate(template)
    setViewDialogOpen(true)
  }

  function addQuestion() {
    setQuestions([...questions, { 
      questionText: '', 
      questionType: 'YES_NO', 
      required: true 
    }])
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, field: keyof Question, value: string | boolean) {
    setQuestions(questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (questions.some(q => !q.questionText.trim())) {
      toast.error('All questions must have text')
      return
    }

    setSubmitting(true)

    try {
      if (editingTemplate) {
        const res = await fetch(`/api/checklist-templates/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, questions }),
        })
        if (!res.ok) throw new Error('Failed to update')
        toast.success('Checklist template updated')
      } else {
        const res = await fetch('/api/checklist-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, questions }),
        })
        if (!res.ok) throw new Error('Failed to create')
        toast.success('Checklist template created')
      }

      setDialogOpen(false)
      resetForm()
      fetchTemplates()
    } catch (error) {
      toast.error('Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this checklist template?')) return

    try {
      const res = await fetch(`/api/checklist-templates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Checklist template deleted')
      fetchTemplates()
    } catch (error) {
      toast.error('Failed to delete template')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 p-6">
        <div className="absolute inset-0 text-cyan-500 opacity-10">
          <CircuitPattern />
        </div>
        <GlowLine position="top" color="cyan" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400 text-xs font-mono">ADMIN</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Checklist Templates</h1>
              <p className="text-slate-400 text-sm">Create and manage checklist templates</p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Checklist Template' : 'Add Checklist Template'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., HV Test Checklist"
                  required
                  className="border-slate-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="border-slate-300"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Questions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="border-slate-300">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-500">No questions yet</p>
                    <Button type="button" variant="outline" className="mt-2 border-slate-300" onClick={addQuestion}>
                      Add First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <div className="flex items-start gap-3">
                          <GripVertical className="h-5 w-5 text-slate-400 mt-2" />
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-500">
                                Q{index + 1}
                              </span>
                              <Input
                                value={question.questionText}
                                onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                                placeholder="Enter question text..."
                                className="flex-1 border-slate-300"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQuestion(index)}
                                className="hover:bg-red-50"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4">
                              <Select
                                value={question.questionType}
                                onValueChange={(value) => updateQuestion(index, 'questionType', value)}
                              >
                                <SelectTrigger className="w-40 border-slate-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="YES_NO">Yes / No</SelectItem>
                                  <SelectItem value="TEXT">Text</SelectItem>
                                  <SelectItem value="NUMBER">Number</SelectItem>
                                </SelectContent>
                              </Select>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={question.required}
                                  onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                                  className="rounded border-slate-300"
                                />
                                Required
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 border-slate-300">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingTemplate ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* View Checklist Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="bg-cyan-100 p-2 rounded-lg">
                <ClipboardList className="h-5 w-5 text-cyan-600" />
              </div>
              {viewingTemplate?.name}
            </DialogTitle>
            {viewingTemplate?.description && (
              <p className="text-slate-600 text-left">{viewingTemplate.description}</p>
            )}
          </DialogHeader>
          
          {viewingTemplate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <span className="text-sm font-medium text-slate-500">
                  {viewingTemplate.questions.length} Questions
                </span>
                <Badge variant="outline" className="border-slate-300">
                  {viewingTemplate.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {viewingTemplate.questions
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-semibold text-cyan-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="font-medium text-slate-800">
                          {question.questionText}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs bg-slate-200 text-slate-700"
                          >
                            {question.questionType === 'YES_NO' ? 'Yes / No' : 
                             question.questionType === 'NUMBER' ? 'Number' : 'Text'}
                          </Badge>
                          {question.required ? (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-slate-300">
                              Optional
                            </Badge>
                          )}
                        </div>
                        
                        {/* Example input based on question type */}
                        <div className="pt-2">
                          {question.questionType === 'YES_NO' && (
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name={`example-${question.id}`} className="w-4 h-4" disabled />
                                Evet
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <input type="radio" name={`example-${question.id}`} className="w-4 h-4" disabled />
                                Hayır
                              </label>
                            </div>
                          )}
                          {question.questionType === 'NUMBER' && (
                            <input 
                              type="number" 
                              placeholder="Sayı giriniz..." 
                              className="w-32 p-2 border border-slate-300 rounded text-sm bg-white"
                              disabled
                            />
                          )}
                          {question.questionType === 'TEXT' && (
                            <input 
                              type="text" 
                              placeholder="Metin giriniz..." 
                              className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                              disabled
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => setViewDialogOpen(false)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {templates.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <ClipboardList className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium">No checklist templates yet</h3>
            <p className="text-slate-500 mt-1">
              Create your first checklist template
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="border-slate-200 hover:border-cyan-200 transition-colors cursor-pointer" 
                  onClick={() => handleView(template)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-100 p-2.5 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="text-slate-500">{template.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="outline" className="border-slate-300">
                      {template.questions.length} question{template.questions.length !== 1 ? 's' : ''}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)} className="hover:bg-slate-100">
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {template.questions.slice(0, 3).map((q, i) => (
                    <div key={q.id} className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">{i + 1}.</span>
                      <span>{q.questionText}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                        {q.questionType === 'YES_NO' ? 'Yes/No' : q.questionType === 'NUMBER' ? 'Number' : 'Text'}
                      </Badge>
                    </div>
                  ))}
                  {template.questions.length > 3 && (
                    <p className="text-sm text-slate-500">
                      +{template.questions.length - 3} more questions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
