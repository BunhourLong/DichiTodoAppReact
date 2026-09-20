import { Link, useParams } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  TriangleAlert,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/hooks/useFetch'
import { API_BASE, initialsOf } from '@/lib/api'
import type { User } from '@/types/user'

interface DetailRowProps {
  icon: LucideIcon
  label: string
  children: ReactNode
}

function DetailRow({ icon: Icon, label, children }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm break-words">{children}</p>
      </div>
    </div>
  )
}

export default function UserDetailPage() {
  // The URL is the input to this page: /users/3 fetches user 3. Change the id
  // and `url` changes, so the hook's effect re-runs and re-guards the race.
  const { id } = useParams()

  // Same hook, a different `T`: one user, not a list.
  const { data: user, loading, error } = useFetch<User>(`${API_BASE}/users/${id}`)

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2.5">
        <Link to="/users">
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to directory
        </Link>
      </Button>

      {loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>User not available</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {user && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  @{user.username}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="mb-2" />
            <DetailRow icon={Mail} label="Email">
              {user.email}
            </DetailRow>
            <DetailRow icon={Phone} label="Phone">
              {user.phone}
            </DetailRow>
            <DetailRow icon={Globe} label="Website">
              {user.website}
            </DetailRow>
            <DetailRow icon={MapPin} label="Address">
              {user.address.suite}, {user.address.street}, {user.address.city}{' '}
              {user.address.zipcode}
            </DetailRow>
            <DetailRow icon={Building2} label="Company">
              {user.company.name} — {user.company.catchPhrase}
            </DetailRow>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
