using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Routing;

namespace GridExperiment
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            var config = GlobalConfiguration.Configuration;

            config.Routes.MapHttpRoute(
                "API Default",
                "api/{controller}/{id}",
                new { id = RouteParameter.Optional }
            );

            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Home", action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}
