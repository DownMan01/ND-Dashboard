"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import type { Database } from "@/types/supabase"

type Collection = Database["public"]["Tables"]["airdrop_collections"]["Row"]
type Requirement = { id: number; title: string }
type Step = { step: number; title: string }

export default function EditCollectionPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    image_url: "",
    description: "",
    backers: "",
    chain: "",
    cost: "",
    stage: "Upcoming",
    requirements: [
      { id: 1, title: "" },
      { id: 2, title: "" },
      { id: 3, title: "" },
      { id: 4, title: "" },
    ] as Requirement[],
    how_to_steps: [
      { step: 1, title: "" },
      { step: 2, title: "" },
      { step: 3, title: "" },
      { step: 4, title: "" },
      { step: 5, title: "" },
    ] as Step[],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCollection() {
      if (!user) return

      const { data, error } = await supabase
        .from("airdrop_collections")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (error) {
        console.error("Error fetching collection:", error)
        toast({
          title: "Error",
          description: "Failed to fetch collection",
          variant: "destructive",
        })
        router.push("/dashboard/collections")
        return
      }

      // Format backers array to string
      const backersString = data.backers.join(", ")

      // Ensure requirements and how_to_steps have the expected structure
      const requirements = Array.isArray(data.requirements)
        ? data.requirements.map((req: any) => ({ id: req.id, title: req.title }))
        : [
            { id: 1, title: "" },
            { id: 2, title: "" },
            { id: 3, title: "" },
            { id: 4, title: "" },
          ]

      const how_to_steps = Array.isArray(data.how_to_steps)
        ? data.how_to_steps.map((step: any) => ({ step: step.step, title: step.title }))
        : [
            { step: 1, title: "" },
            { step: 2, title: "" },
            { step: 3, title: "" },
            { step: 4, title: "" },
            { step: 5, title: "" },
          ]

      setFormData({
        name: data.name,
        subtitle: data.subtitle,
        image_url: data.image_url || "",
        description: data.description || "",
        backers: backersString,
        chain: data.chain,
        cost: data.cost?.toString() || "",
        stage: data.stage,
        requirements,
        how_to_steps,
      })

      setIsLoading(false)
    }

    fetchCollection()
  }, [params.id, user, router, toast, supabase])

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
        description: "You must be logged in to update a collection",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase
      .from("airdrop_collections")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    setIsSubmitting(false)

    if (error) {
      console.error("Error updating collection:", error)
      toast({
        title: "Error",
        description: "Failed to update collection",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Collection updated successfully",
    })

    router.push(`/dashboard/collections/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href={`/dashboard/collections/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-6 w-36 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <Card className="animate-pulse">
            <CardHeader className="p-4 sm:p-6">
              <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
              <div className="h-4 w-1/3 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="h-9 sm:h-10 bg-muted rounded"></div>
              <div className="h-9 sm:h-10 bg-muted rounded"></div>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/dashboard/collections/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Edit Collection</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Basic Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Edit the basic details of your airdrop collection
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
              <CardDescription className="text-xs sm:text-sm">Edit the project and token details</CardDescription>
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
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Ended">Ended</SelectItem>
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
              <CardDescription className="text-xs sm:text-sm">Edit the requirements for participation</CardDescription>
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
              <CardDescription className="text-xs sm:text-sm">Edit how to participate in the airdrop</CardDescription>
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

