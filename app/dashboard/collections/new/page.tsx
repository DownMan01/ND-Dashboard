"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function NewCollectionPage() {
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    image_url: "",
    description: "",
    backers: "",
    chain: "",
    cost: "",
    stage: "upcoming",
    requirements: [
      { id: 1, title: "" },
      { id: 2, title: "" },
      { id: 3, title: "" },
      { id: 4, title: "" },
    ],
    how_to_steps: [
      { step: 1, title: "" },
      { step: 2, title: "" },
      { step: 3, title: "" },
      { step: 4, title: "" },
      { step: 5, title: "" },
    ],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements]
    newRequirements[index] = { ...newRequirements[index], title: value }
    setFormData({ ...formData, requirements: newRequirements })
  }

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...formData.how_to_steps]
    newSteps[index] = { ...newSteps[index], title: value }
    setFormData({ ...formData, how_to_steps: newSteps })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a collection",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from("airdrop_collections").insert([
      {
        name: formData.name,
        subtitle: formData.subtitle,
        image_url: formData.image_url || null,
        description: formData.description,
        backers: formData.backers.split(",").map((b) => b.trim()),
        chain: formData.chain,
        cost: formData.cost ? Number.parseFloat(formData.cost) : 0,
        stage: formData.stage,
        requirements: formData.requirements,
        how_to_steps: formData.how_to_steps,
        user_id: user.id,
      },
    ])

    setIsSubmitting(false)

    if (error) {
      console.error("Error creating collection:", error)
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Collection created successfully",
    })

    router.push("/dashboard/collections")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard/collections">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Create New Collection</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Enter the basic details of your airdrop collection
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter collection name"
                    required
                    className="h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="image_url" className="text-sm">
                    Image URL
                  </Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Enter image URL"
                    className="h-9 sm:h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="subtitle" className="text-sm">
                  Subtitle
                </Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter a brief subtitle"
                  required
                  className="h-9 sm:h-10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed description"
                  rows={3}
                  className="min-h-[80px] sm:min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Project Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Enter the project and token details</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="chain" className="text-sm">
                    Chain
                  </Label>
                  <Input
                    id="chain"
                    value={formData.chain}
                    onChange={(e) => setFormData({ ...formData, chain: e.target.value })}
                    placeholder="e.g., Ethereum"
                    required
                    className="h-9 sm:h-10"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="cost" className="text-sm">
                    Cost (USD)
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                    className="h-9 sm:h-10"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1 space-y-1.5 sm:space-y-2">
                  <Label htmlFor="stage" className="text-sm">
                    Stage
                  </Label>
                  <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value })}>
                    <SelectTrigger id="stage" className="h-9 sm:h-10">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="backers" className="text-sm">
                  Backers
                </Label>
                <Input
                  id="backers"
                  value={formData.backers}
                  onChange={(e) => setFormData({ ...formData, backers: e.target.value })}
                  placeholder="Enter backers (comma-separated)"
                  className="h-9 sm:h-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Requirements</CardTitle>
              <CardDescription className="text-xs sm:text-sm">List the requirements for participation</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
              {formData.requirements.map((req, index) => (
                <div key={req.id} className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={`req-title-${index}`} className="text-sm">
                    Requirement {index + 1}
                  </Label>
                  <Input
                    id={`req-title-${index}`}
                    value={req.title}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="h-9 sm:h-10"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">How To Steps</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Explain how to participate in the airdrop
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
              {formData.how_to_steps.map((step, index) => (
                <div key={step.step} className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor={`step-title-${index}`} className="text-sm">
                    Step {index + 1}
                  </Label>
                  <Input
                    id={`step-title-${index}`}
                    value={step.title}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="h-9 sm:h-10"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3 sm:gap-4 sticky bottom-20 sm:bottom-0 bg-background py-3 sm:py-4 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 h-9 sm:h-10 text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-9 sm:h-10 text-sm">
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

