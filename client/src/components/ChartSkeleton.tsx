import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-48 animate-shimmer" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-72 mt-2 animate-shimmer" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-shimmer" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg animate-shimmer"
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-32 animate-shimmer" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-20 animate-shimmer" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
